import prisma from "@/lib/prisma"
import { Brand } from "@/generated/prisma/client"

export interface CreateBrandData {
  name: string
  slug: string
  logoUrl: string
  createdBy: number
  updatedBy: number
}

export type BradUpdatedData = Partial<Omit<CreateBrandData, "createdBy">>

export class BrandRepository {
  async create(data: CreateBrandData): Promise<Brand> {
    const result = prisma.brand.create({
      data: {
        ...data,
      },
    })
    return result
  }

  async listAll() {
    const result = prisma.brand.findMany({
      where: {
        deletedAt: null,
        deletedBy: null,
      },
    })
    return result
  }

  async getById(brandId: number) {
    const result = prisma.brand.findUnique({
      where: {
        id: brandId,
        deletedAt: null,
        deletedBy: null,
      },
    })

    return result
  }

  async update(brandId: number, data: BradUpdatedData) {
    const result = prisma.brand.update({
      where: {
        id: brandId,
      },
      data: {
        ...data,
      },
    })

    return result
  }

  async softDelete(brandId: number, userId: number) {
    await prisma.brand.update({
      where: {
        id: brandId,
      },
      data: {
        deletedAt: new Date(),
        deletedBy: userId,
      },
    })
  }
}

export default new BrandRepository()
