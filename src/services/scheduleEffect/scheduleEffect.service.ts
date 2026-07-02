import { HttpError } from "@/errors/httpError"
import ScheduleEffectRepository from "@/repositories/scheduleEffect/scheduleEffect.repository"
import ScheduleRepository from "@/repositories/schedule/schedule.respository"
import EffectRepository from "@/repositories/effect/effect.repository"
import { CreateScheduleEffectSchema } from "@/schemas/scheduleEffect/scheduleEffect.schemas"

export class ScheduleEffectService {
  constructor(
    private repository = ScheduleEffectRepository,
    private scheduleRepository = ScheduleRepository,
    private effectRepository = EffectRepository,
  ) {}

  async create(data: CreateScheduleEffectSchema) {
    const schedule = await this.scheduleRepository.getById(data.scheduleId)
    if (!schedule) throw new HttpError(404, "Schedule not found")

    const effect = await this.effectRepository.getById(data.effectId)
    if (!effect) throw new HttpError(404, "Effect not found")

    return await this.repository.create(data)
  }

  async getById(scheduleEffectId: number) {
    const scheduleEffect = await this.repository.getById(scheduleEffectId)

    if (!scheduleEffect) throw new HttpError(404, "ScheduleEffect not found")

    return scheduleEffect
  }

  async getByScheduleId(scheduleId: number) {
    const schedule = await this.scheduleRepository.getById(scheduleId)
    if (!schedule) throw new HttpError(404, "Schedule not found")

    const scheduleEffects = await this.repository.getByScheduleId(scheduleId)

    if (scheduleEffects.length === 0)
      throw new HttpError(404, "Schedule effects not found")

    return scheduleEffects
  }

  async getByEffectId(effectId: number) {
    const effect = await this.effectRepository.getById(effectId)
    if (!effect) throw new HttpError(404, "Effect not found")

    const scheduleEffects = await this.repository.getByEffectId(effectId)

    if (scheduleEffects.length === 0)
      throw new HttpError(404, "Schedule effects not found")

    return scheduleEffects
  }

  async listAll() {
    return await this.repository.listAll()
  }

  async delete(scheduleEffectId: number) {
    const scheduleEffect = await this.repository.getById(scheduleEffectId)

    if (!scheduleEffect) throw new HttpError(404, "Schedule effect not found")

    try {
      await this.repository.delete(scheduleEffectId)
    } catch (error) {
      console.log(error)
      throw new HttpError(500, "Failed to delete scheduleEffect")
    }
  }
}

export default new ScheduleEffectService()
