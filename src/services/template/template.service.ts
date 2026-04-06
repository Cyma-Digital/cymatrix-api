import { HttpError } from "@/errors/httpError"
import { Prisma } from "@/generated/prisma/client"
import TemplateRepository from "@/repositories/template/template.repository"
import {
  CreateTemplateServiceInput,
  UpdateTemplateServiceInput,
} from "@/schemas/template/template.schemas"

export class TemplateService {
  constructor(private repository = TemplateRepository) {}

  async create(data: CreateTemplateServiceInput) {
    const template = await this.repository.getByName(data.name)
    if (template) {
      throw new HttpError(409, "Template name already exists.")
    }

    return await this.repository.create(data)
  }

  async listAll() {
    return await this.repository.listAll()
  }

  async listActive() {
    return await this.repository.listActive()
  }

  async getById(templateId: number) {
    const template = await this.repository.getById(templateId)
    if (!template) throw new HttpError(404, "Template not found")
    return template
  }

  async update(templateId: number, data: UpdateTemplateServiceInput) {
    const existingTemplate = await this.repository.getById(templateId)
    if (!existingTemplate) {
      throw new HttpError(404, "Template not found")
    }

    if (data.name && data.name !== existingTemplate.name) {
      const templateWithName = await this.repository.getByName(data.name)
      if (templateWithName && templateWithName.id !== templateId) {
        throw new HttpError(409, "Template name already exists")
      }
    }

    return await this.repository.update(templateId, {
      ...data,
      preset: data.preset as Prisma.InputJsonValue,
      editableFields: data.editableFields as Prisma.InputJsonValue,
    })
  }

  async delete(templateId: number, deletedBy: number) {
    const template = await this.repository.getById(templateId)
    if (!template) {
      throw new HttpError(404, "Template not found")
    }

    try {
      await this.repository.softDelete(templateId, deletedBy)
    } catch (error) {
      console.log(error)
      throw new HttpError(500, "Failed to delete template")
    }
  }
}

export default new TemplateService()
