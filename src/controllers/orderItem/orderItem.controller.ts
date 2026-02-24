import {
  CreateOrderItemDto,
  createOrderItemSchema,
  orderItemIdSchema,
  UpdateOrderItemDto,
  updateOrderItemPartialSchema,
} from "@/schemas/orderItem/orderItem.schemas"
import orderItemService from "@/services/orderItem/orderItem.service"
import { validateEmptyBody, validateIdParam } from "@utils/http"
import { Request, Response, NextFunction } from "express"

export async function create(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | undefined> {
  try {
    // const data = req.body as CreateOrderItemDto
    const data = createOrderItemSchema.parse(req.body)
    const userId = 1

    const orderItem = await orderItemService.create(
      {
        ...data,
        createdBy: userId,
        updatedBy: userId,
      },
      userId,
    )

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
    const { id } = orderItemIdSchema.parse(req.params)

    const orderItem = await orderItemService.getById(id)

    return res.status(200).send({ status: "success", data: orderItem })
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
    const { id } = orderItemIdSchema.parse(req.params)
    // const data = req.body as UpdateOrderItemDto
    const data = updateOrderItemPartialSchema.parse(req.body)
    const userId = 1

    const orderItem = await orderItemService.updatePartial(id, {
      ...data,
      updatedBy: userId,
    })

    return res.status(200).send({ status: "success", data: orderItem })
  } catch (error) {
    next(error)
  }
}

export async function deleteOrderItem(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = orderItemIdSchema.parse(req.params)
    const userId = 1

    await orderItemService.delete(id, userId)

    return res.status(204).send()
  } catch (error) {
    next(error)
  }
}
