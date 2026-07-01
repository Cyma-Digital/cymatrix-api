import prisma from "@/lib/prisma"

export interface CreateUserEffectData {
  userId: number
  effectId: number
}

export class UserEffectRepository {
  async create(data: CreateUserEffectData) {
    const result = await prisma.userEffect.create({
      data: {
        ...data,
      },
    })

    return result
  }

  async getById(userEffectId: number) {
    return await prisma.userEffect.findFirst({
      where: {
        id: userEffectId,
      },
    })
  }

  async getByUserId(userId: number) {
    return await prisma.userEffect.findMany({
      where: {
        userId: userId,
      },
    })
  }

  async getByEffectId(effectId: number) {
    return await prisma.userEffect.findMany({
      where: {
        effectId: effectId,
      },
    })
  }

  async listAll() {
    const result = prisma.userEffect.findMany()

    return result
  }

  async listEffectByUserId(userId: number) {
    const result = prisma.userEffect.findMany({
      where: {
        user: {
          id: userId,
        },
      },
      select: {
        effect: true,
      },
    })

    const effect = (await result).map((eff) => eff.effect)

    return effect
  }

  async delete(userEffectId: number) {
    await prisma.userEffect.delete({
      where: {
        id: userEffectId,
      },
    })
  }
}

export default new UserEffectRepository()
