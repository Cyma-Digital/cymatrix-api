import prisma from "@/lib/prisma"

export interface CreateTemplateEffectData {
  effectId: number
  templateId: number
}

export class TemplateEffectRepository {
  async create(data: CreateTemplateEffectData) {
    const result = await prisma.templateEffect.create({
      data: {
        ...data,
      },
    })

    return result
  }

  async getById(templateEffectId: number) {
    return await prisma.templateEffect.findFirst({
      where: {
        id: templateEffectId,
      },
    })
  }

  async getByTemplateId(templateId: number) {
    return await prisma.templateEffect.findMany({
      where: {
        templateId: templateId,
      },
    })
  }

  async getByEffectId(effectId: number) {
    return await prisma.templateEffect.findMany({
      where: {
        effectId: effectId,
      },
    })
  }

  async listAll() {
    const result = prisma.templateEffect.findMany()

    return result
  }

  async delete(templateEffectId: number) {
    await prisma.templateEffect.delete({
      where: {
        id: templateEffectId,
      },
    })
  }
}

export default new TemplateEffectRepository()
