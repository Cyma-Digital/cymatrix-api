import { HttpError } from "@/errors/httpError"
import { verifyAccessToken } from "@/utils/jwt"
import { NextFunction, Request, Response } from "express"

function extractTokenFromHeader(authHeader: string | undefined): string {
  if (!authHeader) throw new HttpError(401, "Unauthorized")

  if (!authHeader.startsWith("Bearer "))
    throw new HttpError(401, "Unauthorized")

  const token = authHeader.replace("Bearer ", "").trim()

  if (!token) throw new HttpError(401, "Unauthorized")

  return token
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    const token = extractTokenFromHeader(req.headers.authorization)

    const payload = verifyAccessToken(token)

    req.user = payload

    next()
  } catch (error) {
    next(error)
  }
}
