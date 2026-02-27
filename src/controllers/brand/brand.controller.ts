import brandService from "@/services/brand/brand.service"
import { Request, Response, NextFunction } from "express"
import {
  brandIdSchema,
  createBrandSchema,
  updateBrandPartialSchema,
} from "@/schemas/brand/brand.schemas"

export async function create(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | undefined> {
  try {
    // const data = req.body as CreateBrandDto
    const data = createBrandSchema.parse(req.body)

    const userId = 1

    const brand = await brandService.create({
      ...data,
      createdBy: userId,
      updatedBy: userId,
    })

    return res.status(201).json({
      status: "success",
      data: brand,
    })
  } catch (error) {
    next(error)
  }
}

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const brands = await brandService.listAll()
    return res.status(200).json({
      status: "success",
      data: brands,
    })
  } catch (error) {
    next(error)
  }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = brandIdSchema.parse(req.params)

    const brand = await brandService.getById(id)

    return res.status(200).send({ status: "success", data: brand })
  } catch (error) {
    next(error)
  }
}

export async function updatePartial(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = brandIdSchema.parse(req.params)
    // const data = req.body as UpdateBrandDto
    const data = updateBrandPartialSchema.parse(req.body)
    const userId = 1

    const brand = await brandService.updatePartial(id, {
      ...data,
      updatedBy: userId,
    })

    return res.status(200).send({ status: "success", data: brand })
  } catch (error) {
    next(error)
  }
}

export async function deleteBrand(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    // const id = validateIdParam(req)
    const { id } = brandIdSchema.parse(req.params)
    const userId = 1

    await brandService.delete(id, userId)

    return res.status(204).send()
  } catch (error) {
    next(error)
  }
}
