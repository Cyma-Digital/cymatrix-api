import { HttpError } from "@/errors/httpError"
import { Prisma } from "@/generated/prisma/client"
import DeviceRepository from "@/repositories/device/device.respository"
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
  ) {}

  async isUserReachedScheduleLimit(userId: number) {
    const user = await this.userRepository.getById(userId)
    if (!user || user.schedulesAmount == null) return false
    const scheduleCount = await this.repository.countByUserId(userId)
    return scheduleCount >= user.schedulesAmount
  }

  async create(data: CreateContentScheduleServiceInput) {
    if (data.active !== false) {
      const isUserScheduleLimit = await this.isUserReachedScheduleLimit(
        data.createdBy,
      )
      if (isUserScheduleLimit)
        throw new HttpError(403, "Schedules limit reached")
    }

    const device = await this.deviceRepository.getById(data.deviceId)
    if (!device) throw new HttpError(404, "Device not found")

    const template = await this.templateRepository.getById(data.templateId)
    if (!template) throw new HttpError(404, "Template not found")

    const schedule = await this.repository.create({
      ...data,
      customFields: data.customFields as Prisma.InputJsonValue,
      weekdays: data.weekdays as Prisma.InputJsonValue,
      startDate: data.startDate ? new Date(data.startDate) : undefined,
      endDate: data.endDate ? new Date(data.endDate) : undefined,
    })

    this.pushCurrentContent(data.deviceId)

    return schedule
  }

  async listAll() {
    return await this.repository.listAll()
  }

  async listByDeviceId(deviceId: number) {
    const device = await this.deviceRepository.getById(deviceId)
    if (!device) throw new HttpError(404, "Device not found")

    return await this.repository.listByDeviceId(deviceId)
  }

  async getById(id: number) {
    const schedule = await this.repository.getById(id)
    if (!schedule) throw new HttpError(404, "Content schedule not found")
    return schedule
  }

  async update(id: number, data: UpdateContentScheduleServiceInput) {
    const schedule = await this.repository.getById(id)
    if (!schedule) throw new HttpError(404, "Content schedule not found")

    if (data.active === true && !schedule.active) {
      const isUserScheduleLimit = await this.isUserReachedScheduleLimit(
        schedule.createdBy,
      )
      if (isUserScheduleLimit)
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

    this.pushCurrentContent(schedule.deviceId)

    return updated
  }

  async delete(id: number, deletedBy: number) {
    const schedule = await this.repository.getById(id)
    if (!schedule) throw new HttpError(404, "Content schedule not found")

    try {
      await this.repository.softDelete(id, deletedBy)
      this.pushCurrentContent(schedule.deviceId)
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

      return {
        id: schedule.id,
        preset: basePreset,
        durationSec: schedule.durationSec ?? undefined,
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

  async getCurrentContentByCode(code: string) {
    const device = await this.deviceRepository.getByCode(code)
    if (!device) return []
    return this.getCurrentContent(device.id)
  }
}

export default new ContentScheduleService()
