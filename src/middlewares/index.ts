import { HttpError } from "@/errors/httpError"
import { NextFunction, Request, Response } from "express"
import jwt from "jsonwebtoken"

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  console.log(error)

  if (error instanceof HttpError) {
    return res.status(error.statusCode).json({
      status: "error",
      message: error.message,
      details: error.details,
    })
  }

  if (
    error instanceof jwt.TokenExpiredError ||
    error instanceof jwt.JsonWebTokenError
  ) {
    return res.status(401).json({
      status: "error",
      message: "Unauthorized",
    })
  }

  if (error instanceof Error) {
    return res.status(500).json({
      status: "error",
      message: error.message,
    })
  }

  return res.status(500).json({
    status: "error",
    message: "Internal server error",
  })
}
