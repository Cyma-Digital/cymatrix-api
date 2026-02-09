import prisma from "@/lib/prisma"
import { Address } from "@/generated/prisma/client"

export interface CreateAddressData {
  userId: number
  label: string
  street: string
  number: number
  complement: string
  neighborhood: string
  city: string
  state: string
  zipCode: string
  isDefault: boolean
  createdBy: number
  updatedBy: number
}

export type AddressUpdatedData = Partial<Omit<CreateAddressData, "createdBy">>

export class AddressRepository {
  async create(data: CreateAddressData): Promise<Address> {
    const result = prisma.address.create({
      data: {
        ...data,
      },
    })
    return result
  }

  async listAll() {
    const result = prisma.address.findMany({
      where: {
        deletedAt: null,
        deletedBy: null,
      },
    })
    return result
  }
}

export default new AddressRepository()
