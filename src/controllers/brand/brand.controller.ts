import brandService from "@/services/brand/brand.service"
import { validateEmptyBody, validateIdParam } from "@utils/http"
import { Request, Response, NextFunction } from "express"

export async function create(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | undefined> {
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
    const id = validateIdParam(req)

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
    const id = validateIdParam(req)
    const data = validateEmptyBody(req)

    const brand = await brandService.updatePartial(id, data)

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
    const id = validateIdParam(req)
    const userId = 1

    await brandService.delete(id, userId)

    return res.status(204).send()
  } catch (error) {
    next(error)
  }
}
