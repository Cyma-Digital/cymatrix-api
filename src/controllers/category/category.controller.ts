import categoryService from "@/services/category/category.service"
import { validateEmptyBody, validateIdParam } from "@utils/http"
import { Request, Response, NextFunction } from "express"

export async function create(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | undefined> {
  try {
    const { name, slug, iconUrl } = req.body
    const userId = 1

    const category = await categoryService.create({
      name,
      slug,
      iconUrl,
      createdBy: userId,
      updatedBy: userId,
    })

    return res.status(201).json({
      status: "success",
      data: category,
    })
  } catch (error) {
    next(error)
  }
}

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const categories = await categoryService.listAll()
    return res.status(200).json({
      status: "success",
      data: categories,
    })
  } catch (error) {
    next(error)
  }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const id = validateIdParam(req)

    const category = await categoryService.getById(id)

    return res.status(200).send({ status: "success", data: category })
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

    const category = await categoryService.updatePartial(id, data)

    return res.status(200).send({ status: "success", data: category })
  } catch (error) {
    next(error)
  }
}

export async function deleteCategory(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = validateIdParam(req)
    const userId = 1

    await categoryService.delete(id, userId)

    return res.status(204).send()
  } catch (error) {
    next(error)
  }
}
