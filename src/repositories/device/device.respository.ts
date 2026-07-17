import prisma from "@/lib/prisma"
import { Prisma } from "@/generated/prisma/client"
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

// Canonical shape of the metrics JSON blob persisted on `device.metrics`.
// Single-sourced here and reused on the read side (DeviceService) so a field
// rename can't let the reader and writer drift apart silently.
export interface DeviceMetricsBlob {
  localization: {
    lat: number
    lng: number
    address?: string | null
  }
  // Coordinates that produced the current address. Only moves when a geocode
  // actually runs, so the distance gate measures displacement since the last
  // resolved position rather than since the last (jittering) report.
  anchor: {
    lat: number
    lng: number
  }
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

  async updateOverrides(
    deviceId: number,
    deviceOverrides: Prisma.InputJsonValue | typeof Prisma.JsonNull,
    updatedBy: number,
  ) {
    return await prisma.device.update({
      where: { id: deviceId },
      data: {
        deviceOverrides,
        updatedBy,
        updatedAt: new Date(),
      },
    })
  }

  async updateDataJson(
    deviceId: number,
    dataJson: Prisma.InputJsonValue | typeof Prisma.JsonNull,
    updatedBy: number,
  ) {
    return await prisma.device.update({
      where: { id: deviceId },
      data: { dataJson, updatedBy, updatedAt: new Date() },
    })
  }

  async getMetricsHistory(
    deviceId: number,
    filters: { from?: string; to?: string; limit: number },
  ) {
    return await prisma.deviceMetricsHistory.findMany({
      where: {
        deviceId,
        createdAt: {
          ...(filters.from && { gte: new Date(filters.from) }),
          ...(filters.to && { lte: new Date(filters.to) }),
        },
      },
      orderBy: { createdAt: "desc" },
      take: filters.limit,
    })
  }

  async updateDeviceMetrics(deviceId: number, data: DeviceMetricsBlob) {
    await prisma.$transaction(async (tx) => {
      const updatedAt = new Date().toISOString()

      await tx.device.update({
        where: { id: deviceId },
        data: {
          metrics: {
            ...data,
            updatedAt,
          } as unknown as Prisma.InputJsonValue,
        },
      })

      await tx.deviceMetricsHistory.create({
        data: {
          deviceId,
          // History records the raw reading only — the anchor is derived state.
          data: {
            localization: data.localization,
          } as unknown as Prisma.InputJsonValue,
          createdAt: updatedAt,
        },
      })
    })
  }
}

export default new DeviceRepository()
