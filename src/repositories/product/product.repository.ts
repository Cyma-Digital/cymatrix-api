import prisma from "@/lib/prisma"
import { Product } from "@/generated/prisma/client"

export interface CreateProductData {
  categoryId: number
  brandId: number
  name: string
  price: string
  description: string
  additionalInfo: any
  avaliable: boolean
  createdBy: number
  updatedBy: number
}

export type ProductUpdatedData = Partial<Omit<CreateProductData, "createdBy">>

export class ProductRepository {
  async create(data: CreateProductData): Promise<Product> {
    const result = prisma.product.create({
      data: {
        ...data,
      },
    })

    return result
  }

  async listAll() {
    const result = prisma.product.findMany({
      where: {
        deletedAt: null,
        deletedBy: null,
      },
    })
    return result
  }

  async getById(productId: number) {
    const result = prisma.product.findUnique({
      where: {
        id: productId,
        deletedAt: null,
        deletedBy: null,
      },
    })

    return result
  }

  async update(productId: number, data: ProductUpdatedData) {
    const result = prisma.product.update({
      where: {
        id: productId,
      },
      data: {
        ...data,
      },
    })

    return result
  }

  async softDelete(productId: number, userId: number) {
    await prisma.product.update({
      where: {
        id: productId,
      },
      data: {
        deletedAt: new Date(),
        deletedBy: userId,
      },
    })
  }
}

export default new ProductRepository()
