import { HttpError } from "@/errors/httpError"
import categoryRepository from "@/repositories/category/category.repository"
import {
  CreateCategoryServiceSchemaInput,
  UpdateCategoryPartialServiceInput,
} from "@/schemas/category/category.schemas"

export class CategoryService {
  constructor(private repository = categoryRepository) {}

  async create(data: CreateCategoryServiceSchemaInput) {
    return await this.repository.create(data)
  }

  async listAll() {
    return await this.repository.listAll()
  }

  async getById(categoryId: number) {
    const category = await this.repository.getById(categoryId)

    if (!category) {
      throw new HttpError(404, "Not found")
    }

    return category
  }

  async updatePartial(
    categoryId: number,
    data: UpdateCategoryPartialServiceInput,
  ) {
    const category = await this.getById(categoryId)

    if (!category) {
      throw new HttpError(404, "Not found")
    }

    const updatedCategory = await this.repository.update(categoryId, data)

    if (!updatedCategory) {
      throw new Error("Error on update")
    }

    return updatedCategory
  }

  async delete(categoryId: number, userId: number) {
    const category = await this.repository.getById(categoryId)

    if (!category) {
      throw new HttpError(404, "Not found")
    }

    try {
      await this.repository.softDelete(categoryId, userId)
    } catch {
      throw new HttpError(500, "Failed to delete category")
    }
  }
}

export default new CategoryService()
