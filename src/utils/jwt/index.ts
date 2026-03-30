import jwt, { SignOptions } from "jsonwebtoken"
import { jwtConfig } from "@config/jwt"

export interface TokenPayload {
  userId: number
  email: string
  role: string
}

export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(
    payload,
    jwtConfig.accessTokenSecret as jwt.Secret,
    {
      expiresIn: jwtConfig.accessTokenExpiration,
    } as SignOptions,
  )
}

export function generateRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, jwtConfig.refreshTokenSecret, {
    expiresIn: jwtConfig.refreshTokenExpiration,
  } as SignOptions)
}

export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, jwtConfig.accessTokenSecret) as TokenPayload
}

export function verifyRefreshToken(token: string): TokenPayload {
  return jwt.verify(token, jwtConfig.refreshTokenSecret) as TokenPayload
}
