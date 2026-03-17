import jwt from "jsonwebtoken"
import { jwtConfig } from "@config/jwt"

export interface TokenPayload {
  userdId: number
  email: string
  role: string
}

export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, jwtConfig.accessTokenSecret, {
    expiresIn: parseInt(jwtConfig.accessTokenExpiration),
  })
}

export function generateRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, jwtConfig.refreshTokenSecret, {
    expiresIn: parseInt(jwtConfig.accessTokenExpiration),
  })
}

export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, jwtConfig.accessTokenSecret) as TokenPayload
}

export function verifyRefreshToken(token: string): TokenPayload {
  return jwt.verify(token, jwtConfig.refreshTokenSecret) as TokenPayload
}
