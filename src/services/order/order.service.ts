import { HttpError } from "@/errors/httpError"
import addressRepository from "@/repositories/address/address.repository"
import orderRepository, {
  OrderUpdatedData,
  CreateOrderData,
} from "@/repositories/order/order.repository"

export class OrderService {
  constructor(
    private repository = orderRepository,
    private addressRepo = addressRepository,
  ) {}

  async create(data: CreateOrderData) {
    const address = await this.addressRepo.getById(data.addressId)

    if (!address) {
      throw new HttpError(404, "Address not found")
    }

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

  async updatePartial(orderId: number, data: OrderUpdatedData) {
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
