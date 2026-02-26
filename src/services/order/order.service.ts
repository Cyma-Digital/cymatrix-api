import { HttpError } from "@/errors/httpError"
import orderRepository from "@/repositories/order/order.repository"
import {
  CreateOrderServiceSchemaInput,
  UpdateOrderPartialServiceInput,
  UpdateOrderServiceInput,
} from "@/schemas/order/order.schemas"

export class OrderService {
  constructor(private repository = orderRepository) {}

  async create(data: CreateOrderServiceSchemaInput) {
    return await this.repository.create(data)
  }

  async listAll() {
    return await this.repository.listAll()
  }

  async getById(orderId: number) {
    const order = await this.repository.getById(orderId)

    if (!order) {
      throw new HttpError(404, "Not found")
    }
    return order
  }

  async getOrderWithOrderItems(orderId: number) {
    const order = await this.repository.getOrderWithOrderItems(orderId)

    if (!order) {
      throw new HttpError(404, "Not found")
    }
    return order
  }

  async updatePartial(orderId: number, data: UpdateOrderPartialServiceInput) {
    const order = await this.repository.getById(orderId)

    if (!order) {
      throw new HttpError(404, "Not found")
    }

    if (order.status === "PENDENTE") {
      const updatedOrder = await this.repository.update(orderId, data)

      if (!updatedOrder) {
        throw new Error("Error on update")
      }
      return updatedOrder
    }

    if (
      (data.status && order.status === "APROVADO") ||
      order.status === "ENVIADO"
    ) {
      const updatedOrderStatus = await this.repository.updateStatus(
        orderId,
        data.status!,
      )

      if (!updatedOrderStatus) {
        throw new Error("Error on update")
      }
      return updatedOrderStatus
    }

    if (order.status === "CANCELADO") {
      throw new HttpError(403, "Not allowed change order after cancelled")
    }
  }

  async delete(orderId: number, userId: number) {
    const order = await this.repository.getById(orderId)

    if (!order) {
      throw new HttpError(404, "Not found")
    }

    try {
      await this.repository.softDelete(orderId, userId)
    } catch {
      throw new HttpError(500, "Failed to delete order")
    }
  }
}

export default new OrderService()
