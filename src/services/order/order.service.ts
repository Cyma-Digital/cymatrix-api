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
}

export default new OrderService()
