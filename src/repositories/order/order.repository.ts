import prisma from "@/lib/prisma"
import { Order } from "@/generated/prisma/client"

export interface CreateOrderData {
  userId: number
  status: "APROVADO" | "ENVIADO" | "CANCELADO" | "PENDENTE"
  addressId?: number
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

  async getPendentOrderStatus(userId: number) {
    const result = prisma.order.findFirst({
      where: {
        id: userId,
        deletedAt: null,
        deletedBy: null,
        status: "PENDENTE",
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

  async getOrderWithOrderItems(orderId: number) {
    const result = prisma.order.findUnique({
      where: {
        id: orderId,
        deletedAt: null,
        deletedBy: null,
      },
      include: {
        orderItems: true,
      },
    })

    return result
  }

  async getByUserId(userId: number) {
    const result = prisma.order.findUnique({
      where: {
        id: userId,
        deletedAt: null,
        deletedBy: null,
      },
    })
    return result
  }

  async update(orderId: number, data: OrderUpdatedData) {
    const result = prisma.order.update({
      where: {
        id: orderId,
      },
      data: {
        ...data,
      },
    })

    return result
  }

  async updateStatus(
    orderId: number,
    status: "APROVADO" | "ENVIADO" | "CANCELADO" | "PENDENTE",
  ) {
    const result = prisma.order.update({
      where: {
        id: orderId,
      },
      data: {
        status: status,
      },
    })

    return result
  }

  async softDelete(orderId: number, userId: number) {
    await prisma.order.update({
      where: {
        id: orderId,
      },
      data: {
        deletedAt: new Date(),
        deletedBy: userId,
      },
    })
  }
}

export default new OrderRepository()
