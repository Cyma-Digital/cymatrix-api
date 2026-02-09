import prisma from "@/lib/prisma"

export interface CreateUserData {
  firstName: string
  lastName: string
  email: string
  phone?: string
  document: string
  documentType: "CPF" | "CNPJ"
  passwordHash: string
  role: "STAFF" | "ADMIN" | "CLIENT"
  createdBy: number
  updatedBy: number
}

export class UserRepository {
  async create(data: CreateUserData) {
    const result = await prisma.user.create({
      data: {
        ...data,
      },
    })

    return result
  }

  async getByEmail(userEmail: string) {
    const result = prisma.user.findUnique({
      where: {
        email: userEmail,
      },
    })

    return result
  }
}

export default new UserRepository()
