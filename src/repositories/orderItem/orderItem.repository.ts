import prisma from "@/lib/prisma"
import { OrderItem } from "@/generated/prisma/client"

export interface CreateOrderItemData {
  orderId?: number
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

  async getByUserId(userId: number) {
    const result = prisma.orderItem.findFirst({
      where: {
        createdBy: userId,
        deletedAt: null,
        deletedBy: null,
      },
    })
    return result
  }

  async update(orderItemId: number, data: OrderItemUpdatedData) {
    const result = prisma.orderItem.update({
      where: {
        id: orderItemId,
      },
      data: {
        ...data,
      },
    })

    return result
  }

  async softDelete(orderItemId: number, userId: number) {
    await prisma.orderItem.update({
      where: {
        id: orderItemId,
      },
      data: {
        deletedAt: new Date(),
        deletedBy: userId,
      },
    })
  }
}

export default new OrderItemRepository()
