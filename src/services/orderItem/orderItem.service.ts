import { HttpError } from "@/errors/httpError"
import orderRepository from "@/repositories/order/order.repository"
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

  async create(data: CreateOrderItemData) {
    const order = await this.orderRepo.getById(data.orderId)

    if (!order) {
      throw new HttpError(404, "Order not found")
    }

    const product = await this.productRepo.getById(data.productId)

    if (!product) {
      throw new HttpError(404, "Product not found")
    }

    return await this.repository.create(data)
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
}

export default new OrderItemService()
