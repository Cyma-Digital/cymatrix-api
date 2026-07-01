import { HttpError } from "@/errors/httpError"
import UserEffectRepository from "@/repositories/userEffect/userEffect.repository"
import UserRepository from "@/repositories/user/user.repository"
import EffectRepository from "@/repositories/effect/effect.repository"
import { CreateUserEffectSchema } from "@/schemas/userEffect/userEffect.schemas"

export class UserEffectService {
  constructor(
    private repository = UserEffectRepository,
    private userRepository = UserRepository,
    private effectRepository = EffectRepository,
  ) {}

  async create(data: CreateUserEffectSchema) {
    const user = await this.userRepository.getById(data.userId)
    if (!user) throw new HttpError(404, "User not found")

    const effect = await this.effectRepository.getById(data.effectId)
    if (!effect) throw new HttpError(404, "Effect not found")

    return await this.repository.create(data)
  }

  async getById(userEffectId: number) {
    const userEffect = await this.repository.getById(userEffectId)

    if (!userEffect) throw new HttpError(404, "UserEffect not found")

    return userEffect
  }

  async getByUserId(userId: number) {
    const user = await this.userRepository.getById(userId)
    if (!user) throw new HttpError(404, "User not found")

    const userEffects = await this.repository.getByUserId(userId)

    if (userEffects.length === 0)
      throw new HttpError(404, "User effects not found")

    return userEffects
  }

  async getByEffectId(effectId: number) {
    const effect = await this.effectRepository.getById(effectId)
    if (!effect) throw new HttpError(404, "Effect not found")

    const userEffects = await this.repository.getByEffectId(effectId)

    if (userEffects.length === 0)
      throw new HttpError(404, "User effects not found")

    return userEffects
  }

  async listAll() {
    return await this.repository.listAll()
  }

  async delete(userEffectId: number) {
    const userEffect = await this.repository.getById(userEffectId)

    if (!userEffect) throw new HttpError(404, "User effect not found")

    try {
      await this.repository.delete(userEffectId)
    } catch (error) {
      console.log(error)
      throw new HttpError(500, "Failed to delete userEffect")
    }
  }
}

export default new UserEffectService()
