import { HttpError } from "@/errors/httpError"
import bcrypt from "bcrypt"
import UserRepository from "@/repositories/user/user.repository"

export interface CreateUserInput {
  firstName: string
  lastName: string
  email: string
  phone?: string
  document: string
  documentType: "CPF" | "CNPJ"
  password: string
  role: "STAFF" | "ADMIN" | "CLIENT"
  createdBy: number
  updatedBy: number
}

export class UserService {
  constructor(private repository = UserRepository) {}

  async create(data: CreateUserInput) {
    const user = await this.repository.getByEmail(data.email)

    if (user) {
      throw new HttpError(400, "Email already exists.")
    }

    if (!data.password) {
      throw new HttpError(404, "Passwork not provide.")
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
}

export default new UserService()
