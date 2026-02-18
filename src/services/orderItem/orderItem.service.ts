import { HttpError } from "@/errors/httpError"
import orderRepository, {
  CreateOrderData,
  OrderUpdatedData,
} from "@/repositories/order/order.repository"
import productRepository from "@/repositories/product/product.repository"
import orderItemRepository, {
  OrderItemUpdatedData,
  CreateOrderItemData,
} from "@/repositories/orderItem/orderItem.repository"

export class OrderItemService {
  constructor(
    private repository = orderItemRepository,
    private orderRepo = orderRepository,
    private productRepo = productRepository,
  ) {}

  async create(data: CreateOrderItemData, userId: number) {
    const product = await this.productRepo.getById(data.productId)

    if (!product) {
      throw new HttpError(404, "Product not found")
    }

    const orderItemExistent = await this.repository.getByUserId(userId)

    const orderItem = await this.repository.create(data)

    const totalPrice = Number(orderItem.unitPrice) * orderItem.quantity

    if (orderItemExistent) {
      const order = await this.orderRepo.getByUserId(userId)

      if (order?.status === "PENDENTE") {
        const totalPriceOrder = Number(order?.total) + totalPrice

        const totalOrder: OrderUpdatedData = {
          total: totalPriceOrder.toString(),
        }
        await this.orderRepo.update(order!.id, totalOrder)

        const orderItemData: OrderItemUpdatedData = {
          orderId: order!.id,
        }
        await this.repository.update(orderItem.id, orderItemData)
      } else {
        const orderData: CreateOrderData = {
          userId: userId,
          status: "PENDENTE",
          // addressId: null,
          shippingAddress: "",
          total: totalPrice.toString(),
          createdBy: userId,
          updatedBy: userId,
        }

        const orderCreated = await this.orderRepo.create(orderData)
        const orderCreatedId = orderCreated.id

        const orderItemData: OrderItemUpdatedData = {
          orderId: orderCreatedId,
        }
        await this.repository.update(orderItem.id, orderItemData)
      }
    } else if (!orderItemExistent) {
      const orderData: CreateOrderData = {
        userId: userId,
        status: "PENDENTE",
        // addressId: null,
        shippingAddress: "",
        total: totalPrice.toString(),
        createdBy: userId,
        updatedBy: userId,
      }

      const orderCreated = await this.orderRepo.create(orderData)

      const orderItemData: OrderItemUpdatedData = {
        orderId: orderCreated!.id,
      }
      await this.repository.update(orderItem.id, orderItemData)
    }
    const orderItemUpdated = await this.repository.getById(orderItem.id)

    return orderItemUpdated
  }

  async listAll() {
    return await this.repository.listAll()
  }

  async getById(orderItemId: number) {
    const orderItem = await this.repository.getById(orderItemId)

    if (!orderItem) {
      throw new HttpError(404, "Not found")
    }
    return orderItem
  }

  async updatePartial(orderItemId: number, data: OrderItemUpdatedData) {
    const orderItem = await this.repository.getById(orderItemId)

    if (!orderItem) {
      throw new HttpError(404, "Not found")
    }

    if (data.orderId !== undefined) {
      const order = await this.orderRepo.getById(data.orderId)

      if (!order) {
        throw new HttpError(404, "Order not found")
      }
    }

    if (data.productId !== undefined) {
      const product = await this.productRepo.getById(data.productId)

      if (!product) {
        throw new HttpError(404, "Product not found")
      }
    }

    const updatedOrderItem = await this.repository.update(orderItemId, data)

    if (!updatedOrderItem) {
      throw new Error("Error on update")
    }

    return updatedOrderItem
  }

  async delete(orderItemId: number, userId: number) {
    const orderItem = await this.repository.getById(orderItemId)

    if (!orderItem) {
      throw new HttpError(404, "Not found")
    }

    try {
      await this.repository.softDelete(orderItemId, userId)
    } catch {
      throw new HttpError(500, "Failed to delete order item")
    }
  }
}

export default new OrderItemService()
