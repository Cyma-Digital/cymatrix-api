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
}

export default new OrderItemService()
