import { HttpError } from "@/errors/httpError"
import UserTemplateRepository from "@/repositories/userTemplate/userTemplate.repository"
import UserRepository from "@/repositories/user/user.repository"
import TemplateRepository from "@/repositories/template/template.repository"
import { CreateUserTemplateSchema } from "@/schemas/userTemplate/userTemplate.schemas"

export class UserTemplateService {
  constructor(
    private repository = UserTemplateRepository,
    private userRepository = UserRepository,
    private templateRepository = TemplateRepository,
  ) {}

  async create(data: CreateUserTemplateSchema) {
    const user = await this.userRepository.getById(data.userId)
    if (!user) throw new HttpError(404, "User not found")

    const template = await this.templateRepository.getById(data.templateId)
    if (!template) throw new HttpError(404, "Template not found")

    return await this.repository.create(data)
  }

  async getById(userTemplateId: number) {
    const userTemplate = await this.repository.getById(userTemplateId)

    if (!userTemplate) throw new HttpError(404, "UserTemplate not found")

    return userTemplate
  }

  async getByUserId(userId: number) {
    const user = await this.userRepository.getById(userId)
    if (!user) throw new HttpError(404, "User not found")

    const userTemplates = await this.repository.getByUserId(userId)

    if (userTemplates.length === 0)
      throw new HttpError(404, "User templates not found")

    return userTemplates
  }

  async getByTemplateId(templateId: number) {
    const template = await this.templateRepository.getById(templateId)
    if (!template) throw new HttpError(404, "Template not found")

    const userTemplates = await this.repository.getByTemplateId(templateId)

    if (userTemplates.length === 0)
      throw new HttpError(404, "User templates not found")

    return userTemplates
  }

  async listAll() {
    return await this.repository.listAll()
  }

  async delete(userTemplateId: number) {
    const userTemplate = await this.repository.getById(userTemplateId)

    if (!userTemplate) throw new HttpError(404, "User template not found")

    try {
      await this.repository.delete(userTemplateId)
    } catch (error) {
      console.log(error)
      throw new HttpError(500, "Failed to delete userTemplate")
    }
  }
}

export default new UserTemplateService()
