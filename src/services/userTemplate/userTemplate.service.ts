import { HttpError } from "@/errors/httpError"
import UserTemplateRepository from "@/repositories/userTemplate/userTemplate.repository"
import { CreateUserTemplateSchema } from "@/schemas/userTemplate/userTemplate.schemas"

export class UserTemplateService {
  constructor(private repository = UserTemplateRepository) {}

  async create(data: CreateUserTemplateSchema) {
    return await this.repository.create(data)
  }

  async getById(userTemplateId: number) {
    const userTemplate = await this.repository.getById(userTemplateId)

    if (!userTemplate) throw new HttpError(404, "UserTemplate not found")

    return userTemplate
  }

  async getByUserId(userId: number) {
    const userTemplates = await this.repository.getByUserId(userId)

    if (!userTemplates) throw new HttpError(404, "User templates not found")

    return userTemplates
  }

  async getByTemplateId(templateId: number) {
    const userTemplates = await this.repository.getByTemplateId(templateId)

    if (!userTemplates) throw new HttpError(404, "User templates not found")

    return userTemplates
  }

  async listAll() {
    return await this.repository.listAll()
  }

  async delete(userTemplateId: number) {
    const userTemplate = await this.repository.getById(userTemplateId)

    if (!userTemplate) throw new HttpError(404, "User templates not found")

    try {
      await this.repository.delete(userTemplateId)
    } catch (error) {
      console.log(error)
      throw new HttpError(500, "Failed to delete user")
    }
  }
}

export default new UserTemplateService()
