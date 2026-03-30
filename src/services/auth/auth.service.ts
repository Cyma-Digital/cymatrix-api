import userRepository from "@/repositories/user/user.repository"
import refreshTokenRespository from "@/repositories/refresh-token/refresh.token.repository"
import { LoginInput } from "@/schemas/auth/auth.schemas"
import { HttpError } from "@/errors/httpError"
import argon2 from "@/lib/argon2"
import {
  generateAccessToken,
  generateRefreshToken,
  TokenPayload,
  verifyRefreshToken,
} from "@/utils/jwt"

export class AuthService {
  constructor(
    private userRespository = userRepository,
    private refreshTokenRepository = refreshTokenRespository,
  ) {}

  async login(data: LoginInput) {
    const user = await this.userRespository.getByEmail(data.email)

    if (!user) {
      throw new HttpError(401, "Invalid credentials")
    }

    const isPasswordValid = await argon2.verify(
      user.passwordHash,
      data.password,
    )

    if (!isPasswordValid) {
      throw new HttpError(401, "Invalid credentials")
    }

    await this.refreshTokenRepository.deleteExpired()

    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    }

    const accessToken = generateAccessToken(payload)
    const refreshToken = generateRefreshToken(payload)

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

    await this.refreshTokenRepository.create({
      token: refreshToken,
      userId: user.id,
      expiresAt,
    })

    await this.userRespository.update(user.id, {
      lastLogin: new Date(),
    })

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        role: user.role,
      },
    }
  }

  async refresh(refreshToken: string) {
    let decodedToken: TokenPayload

    try {
      decodedToken = verifyRefreshToken(refreshToken)
    } catch {
      throw new HttpError(401, "Invalid refresh token")
    }

    const storedStoken = await refreshTokenRespository.findByToken(refreshToken)

    if (!storedStoken) throw new HttpError(401, "Refresh token not found")

    if (storedStoken.expiresAt < new Date()) {
      await this.refreshTokenRepository.deleteByToken(refreshToken)
      throw new HttpError(401, "Refresh token expired")
    }

    const payload: TokenPayload = {
      userId: decodedToken.userId,
      email: decodedToken.email,
      role: decodedToken.role,
    }

    const newAcessToken = generateAccessToken(payload)

    return {
      accessToken: newAcessToken,
    }
  }

  async logout(refreshToken: string): Promise<void> {
    try {
      await this.refreshTokenRepository.deleteByToken(refreshToken)
    } catch {
      return
    }
  }
}

export default new AuthService()
