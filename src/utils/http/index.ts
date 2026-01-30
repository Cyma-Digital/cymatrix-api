import { Request } from "express"

export function validateIdParam(req: Request): number {
  const id = req.params.id as string

  if (!id) {
    throw new Error("Invalid param")
  }

  if (isNaN(parseInt(id)) || parseInt(id) < 0) {
    throw new Error("Invalid param")
  }

  return parseInt(id)
}

export function validateEmptyBody(req: Request) {
  const body = req.body

  if (!body) {
    throw new Error("Body is empty")
  }

  return body
}
