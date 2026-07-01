import prisma from "@/lib/prisma"
import { Prisma } from "@/generated/prisma/client"

export interface CreateEffectData {
  name: string
  description?: string | null
  preset: Prisma.InputJsonValue
  editableFields: Prisma.InputJsonValue
  createdBy: number
}

export type UpdateEffectData = Partial<Omit<CreateEffectData, "createdBy">> & {
  updatedBy?: number
  active?: boolean
}

export class EffectRepository {
  private softDeleteFilter = {
    deletedAt: null,
    deletedBy: null,
  }

  async create(data: CreateEffectData) {
    return await prisma.effect.create({
      data: {
        ...data,
      },
    })
  }

  async getById(effectId: number) {
    return await prisma.effect.findFirst({
      where: {
        id: effectId,
        ...this.softDeleteFilter,
      },
    })
  }

  async getByName(name: string) {
    return await prisma.effect.findFirst({
      where: {
        name,
        ...this.softDeleteFilter,
      },
    })
  }

  async listAll() {
    return await prisma.effect.findMany({
      where: {
        ...this.softDeleteFilter,
      },
    })
  }

  async listActive() {
    return await prisma.effect.findMany({
      where: {
        active: true,
        ...this.softDeleteFilter,
      },
    })
  }

  async update(effectId: number, data: UpdateEffectData) {
    return await prisma.effect.update({
      where: { id: effectId },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    })
  }

  async softDelete(effectId: number, deletedBy: number) {
    await prisma.effect.update({
      where: { id: effectId },
      data: {
        deletedAt: new Date(),
        deletedBy,
      },
    })
  }
}

export default new EffectRepository()
