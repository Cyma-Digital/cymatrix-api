import prisma from "@/lib/prisma"

export interface CreateScheduleEffectData {
  effectId: number
  scheduleId: number
}

export class ScheduleEffectRepository {
  async create(data: CreateScheduleEffectData) {
    const result = await prisma.scheduleEffect.create({
      data: {
        ...data,
      },
    })

    return result
  }

  async getById(scheduleEffectId: number) {
    return await prisma.scheduleEffect.findFirst({
      where: {
        id: scheduleEffectId,
      },
    })
  }

  async getByScheduleId(scheduleId: number) {
    return await prisma.scheduleEffect.findMany({
      where: {
        scheduleId: scheduleId,
      },
    })
  }

  async getByEffectId(effectId: number) {
    return await prisma.scheduleEffect.findMany({
      where: {
        effectId: effectId,
      },
    })
  }

  async listAll() {
    const result = prisma.scheduleEffect.findMany()

    return result
  }

  async delete(scheduleEffectId: number) {
    await prisma.scheduleEffect.delete({
      where: {
        id: scheduleEffectId,
      },
    })
  }
}

export default new ScheduleEffectRepository()
