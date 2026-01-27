import { Request, Response } from "express"

const handlers: Record<
  string,
  (req: Request, res: Response) => Promise<Response>
> = {
  GET: handleGet,
  POST: handlePost,
  PUT: handlePut,
  DELETE: handleDelete,
}

export default async function brandController(req: Request, res: Response) {
  const handler = handlers[req.method]

  if (!handler) {
    return res.status(405).json({ error: "Method not allowed" })
  }

  return handler(req, res)
}

async function handleGet(req: Request, res: Response) {
  return res.status(200).json({ message: "GET" })
}

async function handlePost(req: Request, res: Response) {
  return res.status(200).json({ message: "POST" })
}

async function handlePut(req: Request, res: Response) {
  return res.status(200).json({ message: "PUT" })
}

async function handleDelete(req: Request, res: Response) {
  return res.status(200).json({ message: "DELETE" })
}
