import { HttpError } from "@/errors/httpError"
import TemplateEffectRepository from "@/repositories/templateEffect/templateEffect.repository"
import TemplateRepository from "@/repositories/template/template.repository"
import EffectRepository from "@/repositories/effect/effect.repository"
import { CreateTemplateEffectSchema } from "@/schemas/templateEffect/templateEffect.schemas"

export class TemplateEffectService {
  constructor(
    private repository = TemplateEffectRepository,
    private templateRepository = TemplateRepository,
    private effectRepository = EffectRepository,
  ) {}

  async create(data: CreateTemplateEffectSchema) {
    const template = await this.templateRepository.getById(data.templateId)
    if (!template) throw new HttpError(404, "Template not found")

    const effect = await this.effectRepository.getById(data.effectId)
    if (!effect) throw new HttpError(404, "Effect not found")

    return await this.repository.create(data)
  }

  async getById(templateEffectId: number) {
    const templateEffect = await this.repository.getById(templateEffectId)

    if (!templateEffect) throw new HttpError(404, "TemplateEffect not found")

    return templateEffect
  }

  async getByTemplateId(templateId: number) {
    const template = await this.templateRepository.getById(templateId)
    if (!template) throw new HttpError(404, "Template not found")

    const templateEffects = await this.repository.getByTemplateId(templateId)

    if (templateEffects.length === 0)
      throw new HttpError(404, "Template effects not found")

    return templateEffects
  }

  async getByEffectId(effectId: number) {
    const effect = await this.effectRepository.getById(effectId)
    if (!effect) throw new HttpError(404, "Effect not found")

    const templateEffects = await this.repository.getByEffectId(effectId)

    if (templateEffects.length === 0)
      throw new HttpError(404, "Template effects not found")

    return templateEffects
  }

  async listAll() {
    return await this.repository.listAll()
  }

  async delete(templateEffectId: number) {
    const templateEffect = await this.repository.getById(templateEffectId)

    if (!templateEffect) throw new HttpError(404, "Template effect not found")

    try {
      await this.repository.delete(templateEffectId)
    } catch (error) {
      console.log(error)
      throw new HttpError(500, "Failed to delete templateEffect")
    }
  }
}

export default new TemplateEffectService()
