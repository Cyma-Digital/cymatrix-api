import orderItemService from "@/services/orderItem/orderItem.service"
import { validateEmptyBody, validateIdParam } from "@utils/http"
import { Request, Response, NextFunction } from "express"

export async function create(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | undefined> {
  try {
    const { orderId, productId, quantity, unitPrice, createdBy, updatedBy } =
      req.body

    const userId = 1

    const orderItem = await orderItemService.create({
      orderId,
      productId,
      quantity,
      unitPrice,
      createdBy: userId,
      updatedBy: userId,
    })

    return res.status(201).json({
      status: "success",
      data: orderItem,
    })
  } catch (error) {
    next(error)
  }
}

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const orderItems = await orderItemService.listAll()

    return res.status(200).json({
      status: "success",
      data: orderItems,
    })
  } catch (error) {
    next(error)
  }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const id = validateIdParam(req)

    const orderItem = await orderItemService.getById(id)

    return res.status(200).send({ status: "success", data: orderItem })
  } catch (error) {
    next(error)
  }
}
