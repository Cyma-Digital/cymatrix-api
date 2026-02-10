import orderService from "@/services/order/order.service"
import { validateEmptyBody, validateIdParam } from "@utils/http"
import { Request, Response, NextFunction } from "express"

export async function create(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | undefined> {
  try {
    const { userId, status, addressId, shippingAddress, total } = req.body

    const idUser = 1

    const order = await orderService.create({
      userId: idUser,
      status,
      addressId,
      shippingAddress,
      total,
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
