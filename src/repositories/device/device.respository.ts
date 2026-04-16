import prisma from "@/lib/prisma"

export interface CreateDeviceData {
  name: string
  code: string
  address?: string | null
  city?: string | null
  state?: string | null
  zipCode?: string | null
  createdBy: number
  ownerId?: number | null
}

export type UpdateDeviceData = Partial<Omit<CreateDeviceData, "createdBy">> & {
  updatedBy?: number
}

export class DeviceRepository {
  private softDeleteFilter = {
    deletedAt: null,
    deletedBy: null,
  }

  async create(data: CreateDeviceData) {
    return await prisma.device.create({
      data: {
        ...data,
      },
    })
  }

  async getById(deviceId: number) {
    return await prisma.device.findFirst({
      where: {
        id: deviceId,
        ...this.softDeleteFilter,
      },
    })
  }

  async getByCode(code: string) {
    return await prisma.device.findFirst({
      where: {
        code,
        ...this.softDeleteFilter,
      },
    })
  }

  async listAll() {
    return await prisma.device.findMany({
      where: {
        ...this.softDeleteFilter,
      },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    })
  }

  async update(deviceId: number, data: UpdateDeviceData) {
    return await prisma.device.update({
      where: { id: deviceId },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    })
  }

  async updateStatus(deviceId: number, status: "Online" | "Offline") {
    return await prisma.device.update({
      where: { id: deviceId },
      data: {
        status,
        lastSeen: status === "Online" ? new Date() : undefined,
      },
    })
  }

  async softDelete(deviceId: number, deletedBy: number) {
    await prisma.device.update({
      where: { id: deviceId },
      data: {
        deletedAt: new Date(),
        deletedBy,
      },
    })
  }
}

export default new DeviceRepository()
