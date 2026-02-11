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
}

export default new OrderItemRepository()
