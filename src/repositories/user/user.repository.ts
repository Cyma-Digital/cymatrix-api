import prisma from "@/lib/prisma"
import { DocumentType, UserRole } from "@/schemas/base.schemas"

export interface CreateUserData {
  firstName: string
  lastName: string
  email: string
  phone?: string | null
  document: string
  documentType: DocumentType
  passwordHash: string
  role: UserRole
  createdBy: number
  updatedBy: number
}

export interface UpdateUserData {
  firstName: string
  lastName: string
  email: string
  phone?: string | null
  role: UserRole
  updatedBy: number
}

export class UserRepository {
  private softDeleteFilter = {
    deletedAt: null,
    deletedBy: null,
  }

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

  async getById(userId: number) {
    return await prisma.user.findUnique({
      where: {
        id: userId,
        ...this.softDeleteFilter,
      },
    })
  }

  async listAll() {
    const result = prisma.user.findMany({
      where: {
        ...this.softDeleteFilter,
      },
    })

    return result
  }

  async update(userId: number, data: UpdateUserData) {
    return await prisma.user.update({
      where: { id: userId },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    })
  }

  async softDelete(userId: number, deletedBy: number) {
    await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        deletedAt: new Date(),
        deletedBy,
      },
    })
  }
}

export default new UserRepository()
