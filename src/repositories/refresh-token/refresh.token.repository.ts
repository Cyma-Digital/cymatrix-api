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
}

export default new RefreshTokenRespository()
