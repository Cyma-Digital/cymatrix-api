import { HttpError } from "@/errors/httpError"
import { Prisma } from "@/generated/prisma/client"
import EffectRepository from "@/repositories/effect/effect.repository"
import UserRepository from "@/repositories/user/user.repository"
import UserEffectRepository from "@/repositories/userEffect/userEffect.repository"
import {
  CreateEffectServiceInput,
  UpdateEffectServiceInput,
} from "@/schemas/effect/effect.schemas"

export class EffectService {
  constructor(
    private repository = EffectRepository,
    private userRepository = UserRepository,
    private userEffectRepository = UserEffectRepository,
  ) {}

  async create(data: CreateEffectServiceInput) {
    const effect = await this.repository.getByName(data.name)
    if (effect) {
      throw new HttpError(409, "Effect name already exists.")
    }

    return await this.repository.create(data)
  }

  async listAll(userId: number) {
    const user = await this.userRepository.getById(userId)
    if (!user) throw new HttpError(404, "User not found")

    if (user.role === "ADMIN" || user.role === "STAFF")
      return await this.repository.listAll()

    return await this.userEffectRepository.listEffectByUserId(user.id)
  }

  async listActive() {
    return await this.repository.listActive()
  }

  async getById(effectId: number) {
    const effect = await this.repository.getById(effectId)
    if (!effect) throw new HttpError(404, "Effect not found")
    return effect
  }

  async update(effectId: number, data: UpdateEffectServiceInput) {
    const existingEffect = await this.repository.getById(effectId)
    if (!existingEffect) {
      throw new HttpError(404, "Effect not found")
    }

    if (data.name && data.name !== existingEffect.name) {
      const effectWithName = await this.repository.getByName(data.name)
      if (effectWithName && effectWithName.id !== effectId) {
        throw new HttpError(409, "Effect name already exists")
      }
    }

    return await this.repository.update(effectId, {
      ...data,
      preset: data.preset as Prisma.InputJsonValue,
      editableFields: data.editableFields as Prisma.InputJsonValue,
    })
  }

  async delete(effectId: number, deletedBy: number) {
    const effect = await this.repository.getById(effectId)
    if (!effect) {
      throw new HttpError(404, "Effect not found")
    }

    try {
      await this.repository.softDelete(effectId, deletedBy)
    } catch (error) {
      console.log(error)
      throw new HttpError(500, "Failed to delete effect")
    }
  }
}

export default new EffectService()
