import { HttpError } from "@/errors/httpError"
import { Prisma, UserRole } from "@/generated/prisma/client"
import DeviceRepository from "@/repositories/device/device.respository"
import GroupRepository from "@/repositories/group/group.repository"
import ContentScheduleRepository from "@/repositories/schedule/schedule.respository"
import TemplateRepository from "@/repositories/template/template.repository"
import UserRepository from "@/repositories/user/user.repository"
import {
  CreateContentScheduleServiceInput,
  UpdateContentScheduleServiceInput,
} from "@/schemas/schedule/schedule.schemas"
import { pushToDevice, setLastSent } from "@/websocket/websocket.manager"
import { cloneDeep, set } from "lodash-es"

type DeviceOverride = {
  path?: string
  value: Prisma.InputJsonValue
  lock: boolean
}

export class ContentScheduleService {
  constructor(
    private repository = ContentScheduleRepository,
    private deviceRepository = DeviceRepository,
    private templateRepository = TemplateRepository,
    private userRepository = UserRepository,
    private groupRepository = GroupRepository,
  ) {}

  private async isPrivilegedUser(userId: number) {
    const user = await this.userRepository.getById(userId)
    return user?.role === UserRole.ADMIN || user?.role === UserRole.STAFF
  }

  private effectiveOwnerId(schedule: {
    device: { ownerId: number | null } | null
    group: { userId: number } | null
  }) {
    return schedule.device
      ? schedule.device.ownerId
      : (schedule.group?.userId ?? null)
  }

  async isOwnerReachedScheduleLimit(ownerId: number | null) {
    if (!ownerId) return false
    const owner = await this.userRepository.getById(ownerId)
    if (!owner || owner.schedulesAmount == null) return false
    if (owner.role === UserRole.ADMIN || owner.role === UserRole.STAFF)
      return false
    const scheduleCount = await this.repository.countActiveByOwner(ownerId)
    return scheduleCount >= owner.schedulesAmount
  }

  async create(data: CreateContentScheduleServiceInput) {
    if ((data.deviceId === undefined) === (data.groupId === undefined))
      throw new HttpError(
        400,
        "Exactly one of deviceId or groupId must be provided",
      )

    let ownerId: number | null = null

    if (data.deviceId !== undefined) {
      const device = await this.deviceRepository.getById(data.deviceId)
      if (!device) throw new HttpError(404, "Device not found")
      ownerId = device.ownerId
    } else {
      const group = await this.groupRepository.getById(data.groupId!)
      if (!group) throw new HttpError(404, "Group not found")

      if (
        group.userId !== data.createdBy &&
        !(await this.isPrivilegedUser(data.createdBy))
      )
        throw new HttpError(403, "Forbidden")

      ownerId = group.userId
    }

    if (data.active !== false) {
      const isOwnerScheduleLimit =
        await this.isOwnerReachedScheduleLimit(ownerId)
      if (isOwnerScheduleLimit)
        throw new HttpError(403, "Schedules limit reached")
    }

    const template = await this.templateRepository.getById(data.templateId)
    if (!template) throw new HttpError(404, "Template not found")

    const schedule = await this.repository.create({
      ...data,
      customFields: data.customFields as Prisma.InputJsonValue,
      weekdays: data.weekdays as Prisma.InputJsonValue,
      startDate: data.startDate ? new Date(data.startDate) : undefined,
      endDate: data.endDate ? new Date(data.endDate) : undefined,
    })

    if (data.deviceId !== undefined) this.pushCurrentContent(data.deviceId)
    if (data.groupId !== undefined)
      this.pushCurrentContentForGroup(data.groupId)

    return schedule
  }

  async listAll(userId: number) {
    const user = await this.userRepository.getById(userId)
    if (!user) throw new HttpError(404, "User not found")

    if (user.role === UserRole.ADMIN || user.role === UserRole.STAFF)
      return await this.repository.listAll()

    return await this.repository.listByOwner(user.id)
  }

  async listByGroupId(groupId: number, userId: number) {
    const group = await this.groupRepository.getById(groupId)
    if (!group) throw new HttpError(404, "Group not found")

    if (group.userId !== userId && !(await this.isPrivilegedUser(userId)))
      throw new HttpError(403, "Forbidden")

    return await this.repository.listByGroupId(groupId)
  }

  async listByDeviceId(deviceId: number, userId: number) {
    const device = await this.deviceRepository.getById(deviceId)
    if (!device) throw new HttpError(404, "Device not found")

    if (device.ownerId !== userId && !(await this.isPrivilegedUser(userId)))
      throw new HttpError(403, "Forbidden")

    return await this.repository.listByDeviceId(deviceId)
  }

  async getById(id: number, userId: number) {
    const schedule = await this.repository.getById(id)
    if (!schedule) throw new HttpError(404, "Content schedule not found")

    if (
      this.effectiveOwnerId(schedule) !== userId &&
      !(await this.isPrivilegedUser(userId))
    )
      throw new HttpError(403, "Forbidden")

    return schedule
  }

  async update(id: number, data: UpdateContentScheduleServiceInput) {
    const schedule = await this.repository.getById(id)
    if (!schedule) throw new HttpError(404, "Content schedule not found")

    if (
      this.effectiveOwnerId(schedule) !== data.updatedBy &&
      !(await this.isPrivilegedUser(data.updatedBy))
    )
      throw new HttpError(403, "Forbidden")

    if (data.active === true && !schedule.active) {
      const isOwnerScheduleLimit = await this.isOwnerReachedScheduleLimit(
        this.effectiveOwnerId(schedule),
      )
      if (isOwnerScheduleLimit)
        throw new HttpError(403, "Schedules limit reached")
    }

    if (data.templateId) {
      const template = await this.templateRepository.getById(data.templateId)
      if (!template) throw new HttpError(404, "Template not found")
    }

    const updated = await this.repository.update(id, {
      ...data,
      customFields:
        data.customFields !== undefined
          ? (data.customFields as Prisma.InputJsonValue)
          : undefined,
      weekdays:
        data.weekdays !== undefined
          ? (data.weekdays as Prisma.InputJsonValue)
          : undefined,
      startDate:
        data.startDate !== undefined
          ? data.startDate
            ? new Date(data.startDate)
            : null
          : undefined,
      endDate:
        data.endDate !== undefined
          ? data.endDate
            ? new Date(data.endDate)
            : null
          : undefined,
    })

    if (schedule.deviceId !== null) this.pushCurrentContent(schedule.deviceId)
    if (schedule.groupId !== null)
      this.pushCurrentContentForGroup(schedule.groupId)

    return updated
  }

  async delete(id: number, deletedBy: number) {
    const schedule = await this.repository.getById(id)
    if (!schedule) throw new HttpError(404, "Content schedule not found")

    if (
      this.effectiveOwnerId(schedule) !== deletedBy &&
      !(await this.isPrivilegedUser(deletedBy))
    )
      throw new HttpError(403, "Forbidden")

    try {
      await this.repository.softDelete(id, deletedBy)
      if (schedule.deviceId !== null) this.pushCurrentContent(schedule.deviceId)
      if (schedule.groupId !== null)
        this.pushCurrentContentForGroup(schedule.groupId)
    } catch (error) {
      console.log(error)
      throw new HttpError(500, "Failed to delete content schedule")
    }
  }

  async getCurrentContent(deviceId: number) {
    const device = await this.deviceRepository.getById(deviceId) // 👈 adicionar
    if (!device) return []

    const schedules = await this.repository.getActiveByDevice(deviceId)

    const now = new Date()
    const weekday = now.getDay()
    const currentTime = now.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "America/Sao_Paulo",
    })

    const activeSchedules = schedules.filter((schedule) => {
      const weekdays = schedule.weekdays as number[]
      if (!weekdays.includes(weekday)) return false

      if (schedule.startTime && currentTime < schedule.startTime) return false
      if (
        schedule.endTime &&
        schedule.endTime !== "00:00" &&
        currentTime > schedule.endTime
      )
        return false

      if (schedule.startDate && now < new Date(schedule.startDate)) return false
      if (schedule.endDate && now > new Date(schedule.endDate)) return false

      return true
    })

    return activeSchedules.map((schedule) => {
      const basePreset = cloneDeep(
        schedule.template.preset as Record<string, unknown>,
      )
      const customFields = (schedule.customFields ?? {}) as Record<
        string,
        unknown
      >
      const editableFields = (schedule.template.editableFields ?? []) as Array<{
        key: string
        path?: string
      }>

      for (const field of editableFields) {
        const value = customFields[field.key]
        if (value === undefined) continue
        if (!field.path) continue
        set(basePreset, field.path, value)
      }

      const deviceOverrides = device.deviceOverrides as Record<
        string,
        DeviceOverride
      > | null

      if (deviceOverrides) {
        for (const [key, override] of Object.entries(deviceOverrides)) {
          if (!override.lock) continue
          const targetPath = override.path ?? key
          set(basePreset, targetPath, override.value)
        }
      }

      const linkedEffect = schedule.scheduleEffect[0]?.effect.preset as
        | Record<string, unknown>
        | undefined

      return {
        id: schedule.id,
        preset: basePreset,
        durationSec: schedule.durationSec ?? undefined,
        effect: linkedEffect,
        template: {
          id: schedule.template.id,
          name: schedule.template.name,
        },
      }
    })
  }

  async pushCurrentContent(deviceId: number) {
    try {
      const device = await this.deviceRepository.getById(deviceId)
      if (!device) return

      const content = await this.getCurrentContent(deviceId)
      pushToDevice(device.code, {
        type: "content:update",
        data: content,
      })
      setLastSent(device.code, content)
    } catch (error) {
      console.log("[ws] Failed to push content:", error)
    }
  }

  async pushCurrentContentForGroup(groupId: number) {
    try {
      const group = await this.groupRepository.getById(groupId)
      if (!group) return

      for (const groupDevice of group.groupDevices) {
        await this.pushCurrentContent(groupDevice.deviceId)
      }
    } catch (error) {
      console.log("[ws] Failed to push group content:", error)
    }
  }

  async getCurrentContentByCode(code: string) {
    const device = await this.deviceRepository.getByCode(code)
    if (!device) return []
    return this.getCurrentContent(device.id)
  }
}

export default new ContentScheduleService()
