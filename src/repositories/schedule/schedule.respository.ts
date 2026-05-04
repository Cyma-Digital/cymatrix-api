import prisma from "@/lib/prisma"
import { Prisma } from "@/generated/prisma/client"

export interface CreatescheduleData {
  deviceId: number
  templateId: number
  customFields: Prisma.InputJsonValue
  weekdays: Prisma.InputJsonValue
  startTime?: string | null
  endTime?: string | null
  startDate?: Date | null
  endDate?: Date | null
  active?: boolean
  createdBy: number
  durationSec?: number | null
}

export type UpdateScheduleData = Partial<
  Omit<CreatescheduleData, "deviceId" | "createdBy">
> & {
  updatedBy?: number
}

export class scheduleRepository {
  private softDeleteFilter = {
    deletedAt: null,
    deletedBy: null,
  }

  async create(data: CreatescheduleData) {
    return await prisma.schedule.create({
      data: {
        ...data,
      },
      include: {
        template: true,
      },
    })
  }

  async getById(id: number) {
    return await prisma.schedule.findFirst({
      where: {
        id,
        ...this.softDeleteFilter,
      },
      include: {
        template: true,
        device: true,
      },
    })
  }

  async listByDeviceId(deviceId: number) {
    return await prisma.schedule.findMany({
      where: {
        deviceId,
        ...this.softDeleteFilter,
      },
      include: {
        template: true,
      },
    })
  }

  async countByUserId(userId: number) {
    return await prisma.schedule.count({
      where: {
        createdBy: userId,
      },
    })
  }

  async listAll() {
    return await prisma.schedule.findMany({
      where: {
        ...this.softDeleteFilter,
      },
      include: {
        template: true,
        device: true,
      },
    })
  }

  async getActiveByDevice(deviceId: number) {
    return await prisma.schedule.findMany({
      where: {
        deviceId,
        active: true,
        ...this.softDeleteFilter,
      },
      include: {
        template: true,
      },
    })
  }

  async update(id: number, data: UpdateScheduleData) {
    return await prisma.schedule.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
      include: {
        template: true,
      },
    })
  }

  async softDelete(id: number, deletedBy: number) {
    await prisma.schedule.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedBy,
      },
    })
  }
}

export default new scheduleRepository()
