import { HttpError } from "@/errors/httpError"
import { NextFunction, Request, Response } from "express"

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
) {
  console.log(error)

  if (error instanceof HttpError) {
    return res.status(error.statusCode).json({
      status: "error",
      message: error.message,
    })
  }

  if (error instanceof Error) {
    return res.status(404).json({
      status: "error",
      messsage: error.message,
    })
  }

  return res.status(500).json({
    status: "error 1",
    message: "Internal server error",
  })
}
