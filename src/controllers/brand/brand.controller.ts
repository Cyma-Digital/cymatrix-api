import brandService from "@/services/brand/brand.service"
import { Request, Response, NextFunction } from "express"

export async function create(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { name, slug, logoUrl } = req.body

    const userId = 1

    const brand = await brandService.create({
      name,
      slug,
      logoUrl,
      createdBy: userId,
      updatedBy: userId,
    })

    res.status(201).json({
      status: "success",
      data: brand,
    })
  } catch (error) {
    next(error)
  }
}
