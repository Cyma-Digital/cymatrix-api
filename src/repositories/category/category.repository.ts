import prisma from "@/lib/prisma"
import { Category } from "@/generated/prisma/client"

export interface CreateCategoryData {
  name: string
  slug: string
  iconUrl: string
  createdBy: number
  updatedBy: number
}

export type CategoryUpdatedData = Partial<Omit<CreateCategoryData, "createdBy">>

export class CategoryRepository {
  async create(data: CreateCategoryData): Promise<Category> {
    const result = prisma.category.create({
      data: {
        ...data,
      },
    })
    return result
  }

  async listAll() {
    const result = prisma.category.findMany({
      where: {
        deletedAt: null,
        deletedBy: null,
      },
    })
    return result
  }

  async getById(categoryId: number) {
    const result = prisma.category.findUnique({
      where: {
        id: categoryId,
        deletedAt: null,
        deletedBy: null,
      },
    })

    return result
  }

  async update(categoryId: number, data: CategoryUpdatedData) {
    const result = prisma.category.update({
      where: {
        id: categoryId,
      },
      data: {
        ...data,
      },
    })

    return result
  }

  async softDelete(categoryId: number, userId: number) {
    await prisma.category.update({
      where: {
        id: categoryId,
      },
      data: {
        deletedAt: new Date(),
        deletedBy: userId,
      },
    })
  }
}

export default new CategoryRepository()
