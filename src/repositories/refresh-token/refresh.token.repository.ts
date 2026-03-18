import prisma from "@lib/prisma"
import { RefreshToken } from "@/generated/prisma/client"

export interface CreatedRefreshTokenData {
  token: string
  userId: number
  expiresAt: Date
}

export class RefreshTokenRespository {
  async create(data: CreatedRefreshTokenData): Promise<RefreshToken> {
    return await prisma.refreshToken.create({
      data,
    })
  }

  async deleteExpired(): Promise<void> {
    await prisma.refreshToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    })
  }

  async findByToken(token: string): Promise<RefreshToken | null> {
    return await prisma.refreshToken.findUnique({
      where: {
        token,
      },
    })
  }

  async deleteByToken(token: string): Promise<void> {
    await prisma.refreshToken.delete({
      where: {
        token,
      },
    })
  }
}

export default new RefreshTokenRespository()
