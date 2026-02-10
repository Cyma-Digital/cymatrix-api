import prisma from "@/lib/prisma"
import { Order } from "@/generated/prisma/client"

export interface CreateOrderData {
  userId: number
  status: "APROVADO" | "ENVIADO" | "CANCELADO" | "PENDENTE"
  addressId: number
  shippingAddress: any
  total: string
  createdBy: number
  updatedBy: number
}

export type OrderUpdatedData = Partial<Omit<CreateOrderData, "createdBy">>

export class OrderRepository {
  async create(data: CreateOrderData): Promise<Order> {
    const result = prisma.order.create({
      data: {
        ...data,
      },
    })
    return result
  }

  async listAll() {
    const result = prisma.order.findMany({
      where: {
        deletedAt: null,
        deletedBy: null,
      },
    })
    return result
  }

  async getById(orderId: number) {
    const result = prisma.order.findUnique({
      where: {
        id: orderId,
        deletedAt: null,
        deletedBy: null,
      },
    })
    return result
  }
}

export default new OrderRepository()
