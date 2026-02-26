import { HttpError } from "@/errors/httpError"
import bcrypt from "bcrypt"
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

    const passwordHash = await bcrypt.hash(data.password, 10)

    const { password: _, ...dataWithoutPlainTextPassword } = data

    return await this.repository.create({
      ...dataWithoutPlainTextPassword,
      passwordHash,
    })
  }

  async listAll() {
    return await this.repository.listAll()
  }

  async getById(userId: number) {
    const task = await this.repository.getById(userId)

    if (!task) throw new HttpError(404, "User not found")

    return task
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
