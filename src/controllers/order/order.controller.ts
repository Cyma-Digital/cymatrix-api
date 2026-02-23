import {
  CreateOrderDto,
  orderIdSchema,
  UpdateOrderDto,
} from "@/schemas/order/order.schemas"
import orderService from "@/services/order/order.service"
import { validateEmptyBody, validateIdParam } from "@utils/http"
import { Request, Response, NextFunction } from "express"

export async function create(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | undefined> {
  try {
    const data = req.body as CreateOrderDto

    const idUser = 1

    const order = await orderService.create({
      ...data,
      createdBy: idUser,
      updatedBy: idUser,
    })

    return res.status(201).json({
      status: "success",
      data: order,
    })
  } catch (error) {
    next(error)
  }
}

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const orders = await orderService.listAll()
    return res.status(200).json({
      status: "success",
      data: orders,
    })
  } catch (error) {
    next(error)
  }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = orderIdSchema.parse(req.params)

    const order = await orderService.getById(id)

    return res.status(200).send({ status: "success", data: order })
  } catch (error) {
    next(error)
  }
}

export async function getOrderWithOrderItems(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = orderIdSchema.parse(req.params)

    const order = await orderService.getOrderWithOrderItems(id)

    return res.status(200).send({ status: "success", data: order })
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
    const { id } = orderIdSchema.parse(req.params)
    const data = req.body as UpdateOrderDto
    const userId = 1

    const order = await orderService.updatePartial(id, {
      ...data,
      updatedBy: userId,
    })

    return res.status(200).send({ status: "success", data: order })
  } catch (error) {
    next(error)
  }
}

export async function deleteOrder(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = orderIdSchema.parse(req.params)
    const userId = 1

    await orderService.delete(id, userId)

    return res.status(204).send()
  } catch (error) {
    next(error)
  }
}
