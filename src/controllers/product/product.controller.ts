import productService from "@/services/product/product.service"
import { validateEmptyBody, validateIdParam } from "@utils/http"
import { Request, Response, NextFunction } from "express"

export async function create(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | undefined> {
  try {
    const {
      categoryId,
      brandId,
      name,
      price,
      description,
      additionalInfo,
      avaliable,
      imageUrl,
    } = req.body

    const userId = 1

    const product = await productService.create({
      categoryId,
      brandId,
      name,
      price,
      description,
      additionalInfo,
      avaliable,
      imageUrl,
      createdBy: userId,
      updatedBy: userId,
    })

    return res.status(201).json({
      status: "success",
      data: product,
    })
  } catch (error) {
    next(error)
  }
}

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const products = await productService.listAll()

    return res.status(200).json({
      status: "success",
      data: products,
    })
  } catch (error) {
    next(error)
  }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const id = validateIdParam(req)

    const product = await productService.getById(id)

    return res.status(200).send({ status: "success", data: product })
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

    const product = await productService.updatePartial(id, data)

    return res.status(200).send({ status: "success", data: product })
  } catch (error) {
    next(error)
  }
}

export async function deleteProduct(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = validateIdParam(req)
    const userId = 1

    await productService.delete(id, userId)

    return res.status(204).send()
  } catch (error) {
    next(error)
  }
}
