import { Request, Response } from "express"
import prisma from "@lib/prisma"

const allowedMethods = ["GET"]

export default async function statusController(req: Request, res: Response) {
  if (!allowedMethods.includes(req.method)) {
    return res.status(405).json({
      error: "Method not allowed",
    })
  }

  try {
    await prisma.$queryRaw`SELECT 1`

    return res.status(200).json({
      status: "ok",
      database: "connected",
      updated_at: new Date().toISOString(),
    })
  } catch (error) {
    return res.status(500).json({
      status: "error",
      database: "disconnected",
      timestamp: new Date().toISOString(),
      error: error,
    })
  }
}
