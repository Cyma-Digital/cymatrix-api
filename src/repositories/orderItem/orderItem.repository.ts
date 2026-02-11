import prisma from "@/lib/prisma"
import { OrderItem } from "@/generated/prisma/client"

export interface CreateOrderItemData {
  orderId: number
  productId: number
  quantity: number
  unitPrice: string
  createdBy: number
  updatedBy: number
}

export type OrderItemUpdatedData = Partial<
  Omit<CreateOrderItemData, "createdBy">
>

export class OrderItemRepository {
  async create(data: CreateOrderItemData): Promise<OrderItem> {
    const result = prisma.orderItem.create({
      data: {
        ...data,
      },
    })
    return result
  }

  async listAll() {
    const result = prisma.orderItem.findMany({
      where: {
        deletedAt: null,
        deletedBy: null,
      },
    })
    return result
  }

  async getById(orderItemId: number) {
    const result = prisma.orderItem.findUnique({
      where: {
        id: orderItemId,
        deletedAt: null,
        deletedBy: null,
      },
    })
    return result
  }
}

export default new OrderItemRepository()
