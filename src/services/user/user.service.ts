import { HttpError } from "@/errors/httpError"
import argon2 from "@/lib/argon2"
import UserRepository from "@/repositories/user/user.repository"
import {
  CreateUserServiceSchemaInput,
  updateUserServiceInput,
} from "@/schemas/user/user.schemas"

export class UserService {
  constructor(private repository = UserRepository) {}

  async create(data: CreateUserServiceSchemaInput) {
    const user = await this.repository.getByEmail(data.email)

    if (user) {
      throw new HttpError(409, "Email already exists.")
    }

    if (!data.password) {
      throw new HttpError(400, "Password is required")
    }

    const passwordHash = await argon2.hash(data.password)

    const { password: _, ...dataWithoutPlainTextPassword } = data

    return await this.repository.create({
      ...dataWithoutPlainTextPassword,
      passwordHash,
    })
  }

  async currentUser(userId: number) {
    const user = await this.repository.getById(userId)

    if (!user) throw new HttpError(404, "User not found")

    return user
  }

  async listAll() {
    return await this.repository.listAll()
  }

  async getById(userId: number) {
    const user = await this.repository.getById(userId)

    if (!user) throw new HttpError(404, "User not found")

    return user
  }

  async update(userId: number, data: updateUserServiceInput) {
    const existingUser = await this.repository.getById(userId)
    if (!existingUser) {
      throw new HttpError(404, "User not found")
    }

    if (data.email !== existingUser.email) {
      const userWithEmail = await this.repository.getByEmail(data.email)
      if (userWithEmail && userWithEmail.id !== userId) {
        throw new HttpError(409, "Email already exists")
      }
    }

    return await this.repository.update(userId, data)
  }

  async delete(userId: number, deletedBy: number) {
    const user = await this.repository.getById(userId)

    if (!user) {
      throw new HttpError(404, "User not found")
    }

    try {
      await this.repository.softDelete(userId, deletedBy)
    } catch (error) {
      console.log(error)
      throw new HttpError(500, "Failed to delete user")
    }
  }
}

export default new UserService()
