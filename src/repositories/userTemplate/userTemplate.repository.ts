import prisma from "@/lib/prisma"

export interface CreateUserTemplateData {
  userId: number
  templateId: number
}

export class UserTemplateRepository {
  async create(data: CreateUserTemplateData) {
    const result = await prisma.userTemplate.create({
      data: {
        ...data,
      },
    })

    return result
  }

  async getById(userTemplateId: number) {
    return await prisma.userTemplate.findFirst({
      where: {
        id: userTemplateId,
      },
    })
  }

  async getByUserId(userId: number) {
    return await prisma.userTemplate.findMany({
      where: {
        userId: userId,
      },
    })
  }

  async getByTemplateId(templateId: number) {
    return await prisma.userTemplate.findMany({
      where: {
        templateId: templateId,
      },
    })
  }

  async listAll() {
    const result = prisma.userTemplate.findMany()

    return result
  }

  async delete(userTemplateId: number) {
    await prisma.userTemplate.delete({
      where: {
        id: userTemplateId,
      },
    })
  }
}

export default new UserTemplateRepository()
