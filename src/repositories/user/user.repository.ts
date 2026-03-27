import prisma from "@/lib/prisma"
import { UserRole } from "@/schemas/base.schemas"

export interface CreateUserData {
  firstName: string
  lastName: string
  email: string
  phone?: string | null
  passwordHash: string
  role: UserRole
  createdBy: number
  updatedBy: number
}

export type UpdateUserData = Partial<
  Omit<CreateUserData, "createdBy" | "passwordHash">
> & {
  updatedBy?: number // Opcional para atualizações de sistema (ex: lastLogin)
  lastLogin?: Date | null // Adicionar campo lastLogin
}

export class UserRepository {
  private softDeleteFilter = {
    deletedAt: null,
    deletedBy: null,
  }

  private withoutPasswordHashFilter = {
    omit: { passwordHash: true },
  }

  async create(data: CreateUserData) {
    const result = await prisma.user.create({
      data: {
        ...data,
      },
      ...this.withoutPasswordHashFilter,
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
    return await prisma.user.findFirst({
      where: {
        id: userId,
        ...this.softDeleteFilter,
      },
      ...this.withoutPasswordHashFilter,
    })
  }

  async listAll() {
    const result = prisma.user.findMany({
      where: {
        ...this.softDeleteFilter,
      },
      ...this.withoutPasswordHashFilter,
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
      ...this.withoutPasswordHashFilter,
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
