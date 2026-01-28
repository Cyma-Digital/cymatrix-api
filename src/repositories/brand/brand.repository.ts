import prisma from "@/lib/prisma"
import { Brand } from "@/generated/prisma/client"

export interface CreateBrandData {
  name: string
  slug: string
  logoUrl: string
  createdBy: number
  updatedBy: number
}

export class BrandRepository {
  async create(data: CreateBrandData): Promise<Brand> {
    const result = prisma.brand.create({
      data: {
        ...data,
      },
    })
    return result
  }
}

export default new BrandRepository()
