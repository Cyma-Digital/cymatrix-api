import { HttpError } from "@/errors/httpError"
import { Prisma, UserRole } from "@/generated/prisma/client"
import DeviceRepository from "@/repositories/device/device.respository"
import GroupRepository from "@/repositories/group/group.repository"
import UserRepository from "@/repositories/user/user.repository"
import {
  CreateGroupServiceInput,
  UpdateGroupServiceInput,
} from "@/schemas/group/group.schemas"
import contentScheduleService from "@/services/schedule/schedule.service"

export class GroupService {
  constructor(
    private repository = GroupRepository,
    private userRepository = UserRepository,
    private deviceRepository = DeviceRepository,
  ) {}

  private async isPrivilegedUser(userId: number) {
    const user = await this.userRepository.getById(userId)
    return user?.role === UserRole.ADMIN || user?.role === UserRole.STAFF
  }

  private async withDevices(groupId: number) {
    const group = await this.repository.getById(groupId)
    if (!group) throw new HttpError(404, "Group not found")

    const { groupDevices, ...rest } = group
    return {
      ...rest,
      devices: groupDevices.map((groupDevice) => groupDevice.device),
    }
  }

  // Validate that every id resolves to an existing device owned by `ownerId`.
  // All-or-nothing: a single bad id rejects the whole batch so a group is never
  // built from a partially valid set. Returns the deduped id list.
  private async validateOwnedDevices(deviceIds: number[], ownerId: number) {
    const uniqueIds = [...new Set(deviceIds)]

    const devices = await this.deviceRepository.getByIds(uniqueIds)
    if (devices.length !== uniqueIds.length)
      throw new HttpError(404, "Device not found")

    if (devices.some((device) => device.ownerId !== ownerId))
      throw new HttpError(403, "Device belongs to another user")

    return uniqueIds
  }

  async create(data: CreateGroupServiceInput) {
    const ownerId = data.userId ?? data.createdBy

    if (
      ownerId !== data.createdBy &&
      !(await this.isPrivilegedUser(data.createdBy))
    )
      throw new HttpError(403, "Forbidden")

    const owner = await this.userRepository.getById(ownerId)
    if (!owner) throw new HttpError(404, "User not found")

    const deviceIds = data.deviceIds?.length
      ? await this.validateOwnedDevices(data.deviceIds, ownerId)
      : undefined

    const group = await this.repository.create({
      name: data.name,
      userId: ownerId,
      createdBy: data.createdBy,
      deviceIds,
    })

    return await this.withDevices(group.id)
  }

  async listAll(userId: number) {
    const user = await this.userRepository.getById(userId)
    if (!user) throw new HttpError(404, "User not found")

    if (user.role === UserRole.ADMIN || user.role === UserRole.STAFF)
      return await this.repository.listAll()

    return await this.repository.listByOwner(user.id)
  }

  async getById(id: number, userId: number) {
    const group = await this.repository.getById(id)
    if (!group) throw new HttpError(404, "Group not found")

    if (group.userId !== userId && !(await this.isPrivilegedUser(userId)))
      throw new HttpError(403, "Forbidden")

    const { groupDevices, ...rest } = group
    return {
      ...rest,
      devices: groupDevices.map((groupDevice) => groupDevice.device),
    }
  }

  async addDevices(groupId: number, deviceIds: number[], userId: number) {
    const group = await this.repository.getById(groupId)
    if (!group) throw new HttpError(404, "Group not found")

    if (group.userId !== userId && !(await this.isPrivilegedUser(userId)))
      throw new HttpError(403, "Forbidden")

    const uniqueIds = await this.validateOwnedDevices(deviceIds, group.userId)

    const alreadyMember = group.groupDevices.some((groupDevice) =>
      uniqueIds.includes(groupDevice.deviceId),
    )
    if (alreadyMember) throw new HttpError(409, "Device already in group")

    try {
      await this.repository.addDevices(groupId, uniqueIds)
    } catch (error) {
      // The membership snapshot above can race a concurrent add; the
      // @@unique([groupId, deviceId]) constraint is the real guard. Surface a
      // lost race as 409, matching the pre-check contract, not a 500.
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      )
        throw new HttpError(409, "Device already in group")
      throw error
    }

    for (const deviceId of uniqueIds)
      contentScheduleService.pushCurrentContent(deviceId)

    return await this.withDevices(groupId)
  }

  async removeDevice(groupId: number, deviceId: number, userId: number) {
    const group = await this.repository.getById(groupId)
    if (!group) throw new HttpError(404, "Group not found")

    if (group.userId !== userId && !(await this.isPrivilegedUser(userId)))
      throw new HttpError(403, "Forbidden")

    const membership = await this.repository.getMembership(groupId, deviceId)
    if (!membership) throw new HttpError(404, "Device is not in the group")

    await this.repository.removeDevice(groupId, deviceId)

    contentScheduleService.pushCurrentContent(deviceId)
  }

  async update(id: number, data: UpdateGroupServiceInput) {
    const group = await this.repository.getById(id)
    if (!group) throw new HttpError(404, "Group not found")

    if (
      group.userId !== data.updatedBy &&
      !(await this.isPrivilegedUser(data.updatedBy))
    )
      throw new HttpError(403, "Forbidden")

    return await this.repository.update(id, data)
  }

  async delete(id: number, deletedBy: number) {
    const group = await this.repository.getById(id)
    if (!group) throw new HttpError(404, "Group not found")

    if (group.userId !== deletedBy && !(await this.isPrivilegedUser(deletedBy)))
      throw new HttpError(403, "Forbidden")

    try {
      await this.repository.softDelete(id, deletedBy)

      for (const groupDevice of group.groupDevices) {
        contentScheduleService.pushCurrentContent(groupDevice.deviceId)
      }
    } catch (error) {
      console.log(error)
      throw new HttpError(500, "Failed to delete group")
    }
  }
}

export default new GroupService()
