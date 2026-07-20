import prisma from "@/lib/prisma"

export interface CreateGroupData {
  name: string
  userId: number
  createdBy: number
  deviceIds?: number[]
}

export interface UpdateGroupData {
  name?: string
  updatedBy?: number
}

export class GroupRepository {
  private softDeleteFilter = {
    deletedAt: null,
    deletedBy: null,
  }

  // Group and its initial memberships are created atomically: a partially
  // populated group must never be observable if any membership insert fails.
  async create(data: CreateGroupData) {
    const { deviceIds, ...groupData } = data

    return await prisma.$transaction(async (tx) => {
      const group = await tx.group.create({ data: groupData })

      if (deviceIds && deviceIds.length > 0) {
        await tx.groupDevice.createMany({
          data: deviceIds.map((deviceId) => ({ groupId: group.id, deviceId })),
        })
      }

      return group
    })
  }

  async addDevices(groupId: number, deviceIds: number[]) {
    await prisma.groupDevice.createMany({
      data: deviceIds.map((deviceId) => ({ groupId, deviceId })),
    })
  }

  async getById(id: number) {
    return await prisma.group.findFirst({
      where: {
        id,
        ...this.softDeleteFilter,
      },
      include: {
        groupDevices: {
          where: { device: { deletedAt: null } },
          include: { device: true },
        },
      },
    })
  }

  async getMembership(groupId: number, deviceId: number) {
    return await prisma.groupDevice.findFirst({
      where: { groupId, deviceId },
    })
  }

  async removeDevice(groupId: number, deviceId: number) {
    await prisma.groupDevice.deleteMany({
      where: { groupId, deviceId },
    })
  }

  async listAll() {
    return await prisma.group.findMany({
      where: {
        ...this.softDeleteFilter,
      },
    })
  }

  async listByOwner(userId: number) {
    return await prisma.group.findMany({
      where: {
        userId,
        ...this.softDeleteFilter,
      },
    })
  }

  async update(id: number, data: UpdateGroupData) {
    return await prisma.group.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    })
  }

  async softDelete(id: number, deletedBy: number) {
    await prisma.group.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedBy,
      },
    })
  }
}

export default new GroupRepository()
