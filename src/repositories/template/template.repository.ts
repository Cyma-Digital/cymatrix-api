import prisma from "@/lib/prisma"
import { Prisma } from "@/generated/prisma/client"

export interface CreateTemplateData {
  name: string
  description?: string | null
  preset: Prisma.InputJsonValue
  editableFields: Prisma.InputJsonValue
  createdBy: number
}

export type UpdateTemplateData = Partial<
  Omit<CreateTemplateData, "createdBy">
> & {
  updatedBy?: number
  active?: boolean
}

export class TemplateRepository {
  private softDeleteFilter = {
    deletedAt: null,
    deletedBy: null,
  }

  async create(data: CreateTemplateData) {
    return await prisma.template.create({
      data: {
        ...data,
      },
    })
  }

  async getById(templateId: number) {
    return await prisma.template.findFirst({
      where: {
        id: templateId,
        ...this.softDeleteFilter,
      },
    })
  }

  async getByName(name: string) {
    return await prisma.template.findFirst({
      where: {
        name,
        ...this.softDeleteFilter,
      },
    })
  }

  async listAll() {
    return await prisma.template.findMany({
      where: {
        ...this.softDeleteFilter,
      },
    })
  }

  async listActive() {
    return await prisma.template.findMany({
      where: {
        active: true,
        ...this.softDeleteFilter,
      },
    })
  }

  async update(templateId: number, data: UpdateTemplateData) {
    return await prisma.template.update({
      where: { id: templateId },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    })
  }

  async softDelete(templateId: number, deletedBy: number) {
    await prisma.template.update({
      where: { id: templateId },
      data: {
        deletedAt: new Date(),
        deletedBy,
      },
    })
  }
}

export default new TemplateRepository()
