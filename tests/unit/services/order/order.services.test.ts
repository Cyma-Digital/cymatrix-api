import { OrderService } from "@/services/order/order.service"
import { HttpError } from "@/errors/httpError"
import {
  CreateOrderServiceSchemaInput,
  UpdateOrderPartialServiceInput,
} from "@/schemas/order/order.schemas"

const mockRepository = {
  create: vi.fn(),
  listAll: vi.fn(),
  getPendentOrderStatus: vi.fn(),
  getById: vi.fn(),
  getOrderWithOrderItems: vi.fn(),
  getByUserId: vi.fn(),
  update: vi.fn(),
  updateStatus: vi.fn(),
  softDelete: vi.fn(),
}

describe("@services/OrderService", () => {
  let orderService: OrderService

  beforeEach(() => {
    vi.clearAllMocks()
    orderService = new OrderService(mockRepository)
  })

  describe("create()", () => {
    describe("Success cases", () => {
      test("should create and return order", async () => {
        const input: CreateOrderServiceSchemaInput = {
          userId: 1,
          status: "PENDENTE",
          addressId: 1,
          shippingAddress: {
            userId: 1,
            label: "comércio",
            street: "Rua João Silva Souza Soares Santos",
            number: 1,
            complement: "terceiro andar",
            neighborhood: "Jardim de jardins",
            city: "Jacareí",
            state: "SP",
            zipCode: "123.456-78",
            isDefault: true,
          },
          total: "200",
          createdBy: 1,
          updatedBy: 1,
        }

        const expectedOrder = {
          id: 1,
          ...input,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
          deletedBy: null,
        }

        mockRepository.create.mockResolvedValue(expectedOrder)

        const result = await orderService.create(input)

        expect(result).toBeDefined()
        expect(result.id).toBeDefined()
        expect(result).toMatchObject(input)
        expect(result).toEqual(expectedOrder)
        expect(result.id).toBeTypeOf("number")
        expect(result.addressId).toBeTypeOf("number")
        expect(result.total).toBeTypeOf("string")
        expect(result.createdAt).toBeInstanceOf(Date)

        expect(mockRepository.create).toHaveBeenCalled()
        expect(mockRepository.create).toHaveBeenCalledWith(input)
        expect(mockRepository.create).toHaveBeenCalledTimes(1)

        expect(mockRepository.update).not.toHaveBeenCalled()
        expect(mockRepository.softDelete).not.toHaveBeenCalled()
      })
    })
  })

  describe("listAll()", () => {
    describe("Success cases", () => {
      test("should return all orders", async () => {
        const orders = [
          {
            userId: 1,
            status: "PENDENTE",
            addressId: 1,
            shippingAddress: {
              userId: 1,
              label: "loja",
              street: "Rua Zé Silva Souza Soares Santos",
              number: 2,
              neighborhood: "Jardim de cactos",
              city: "Jacareí",
              state: "SP",
              zipCode: "987.654-32",
              isDefault: true,
            },
            total: "135999.99",
            createdBy: 1,
            updatedBy: 1,
          },
          {
            userId: 1,
            status: "ENVIADO",
            addressId: "1",
            shippingAddress: {
              userId: 1,
              label: "loja",
              street: "Rua Zé Silva Souza Soares Santos",
              number: 2,
              neighborhood: "Jardim de cactos",
              city: "Jacareí",
              state: "SP",
              zipCode: "987.654-32",
              isDefault: true,
            },
            total: "150000.99",
            createdBy: 1,
            updatedBy: 1,
          },
          {
            userId: 1,
            status: "CANCELADO",
            addressId: 1,
            shippingAddress: {
              userId: 1,
              label: "loja",
              street: "Rua Zé Silva Souza Soares Santos",
              number: 2,
              neighborhood: "Jardim de cactos",
              city: "Jacareí",
              state: "SP",
              zipCode: "987.654-32",
              isDefault: true,
            },
            total: "8599.99",
            createdBy: 1,
            updatedBy: 1,
          },
        ]

        mockRepository.listAll.mockResolvedValue(orders)

        const result = await orderService.listAll()

        expect(result).toBeDefined()
        expect(result).toHaveLength(3)
        expect(result).toMatchObject(orders)
        expect(Array.isArray(result)).toBe(true)

        expect(mockRepository.listAll).toHaveBeenCalled()
        expect(mockRepository.listAll).toHaveBeenCalledWith()
        expect(mockRepository.listAll).toHaveBeenCalledTimes(1)

        expect(mockRepository.update).not.toHaveBeenCalled()
        expect(mockRepository.create).not.toHaveBeenCalled()
        expect(mockRepository.softDelete).not.toHaveBeenCalled()
      })

      test("should return empty array when no orders", async () => {
        mockRepository.listAll.mockResolvedValue([])

        const result = await orderService.listAll()

        expect(result).toBeDefined()
        expect(result).toEqual([])
        expect(result).toHaveLength(0)
        expect(result).toMatchObject([])
        expect(Array.isArray(result)).toBe(true)

        expect(mockRepository.listAll).toHaveBeenCalled()
        expect(mockRepository.listAll).toHaveBeenCalledWith()
        expect(mockRepository.listAll).toHaveBeenCalledTimes(1)

        expect(mockRepository.update).not.toHaveBeenCalled()
        expect(mockRepository.create).not.toHaveBeenCalled()
        expect(mockRepository.softDelete).not.toHaveBeenCalled()
      })
    })
  })

  describe("getById()", () => {
    describe("Success cases", () => {
      test("should return order when exists", async () => {
        const order = {
          id: 1,
          userId: 1,
          status: "PENDENTE",
          addressId: 1,
          shippingAddress: {
            userId: 1,
            label: "loja",
            street: "Rua Zé Silva Souza Soares Santos",
            number: 2,
            neighborhood: "Jardim de cactos",
            city: "Jacareí",
            state: "SP",
            zipCode: "987.654-32",
            isDefault: true,
          },
          total: "135999.99",
          createdBy: 1,
          updatedBy: 1,
        }

        mockRepository.getById.mockResolvedValue(order)

        const result = await orderService.getById(order.id)

        expect(result).toBeDefined()
        expect(result).toEqual(order)
        expect(result).toMatchObject(order)
        expect(Array.isArray(result)).toBe(false)

        expect(mockRepository.getById).toHaveBeenCalled()
        expect(mockRepository.getById).toHaveBeenCalledWith(order.id)
        expect(mockRepository.getById).toHaveBeenCalledTimes(1)

        expect(mockRepository.update).not.toHaveBeenCalled()
        expect(mockRepository.create).not.toHaveBeenCalled()
        expect(mockRepository.softDelete).not.toHaveBeenCalled()
      })
    })
  })

  describe("getOrderWithOrderItems()", () => {
    describe("Success cases", () => {
      test("should return order with order items when exists", async () => {
        const order = {
          id: 1,
          userId: 1,
          status: "PENDENTE",
          addressId: 1,
          shippingAddress: {
            userId: 1,
            label: "loja",
            street: "Rua Zé Silva Souza Soares Santos",
            number: 2,
            neighborhood: "Jardim de cactos",
            city: "Jacareí",
            state: "SP",
            zipCode: "987.654-32",
            isDefault: true,
          },
          total: "409.99",
          createdBy: 1,
          updatedBy: 1,
          orderItems: [
            {
              id: 1,
              orderId: 1,
              productId: 1,
              quantity: 2,
              unitPrice: "209.99",
            },
            {
              id: 1,
              orderId: 1,
              productId: 1,
              quantity: 1,
              unitPrice: "200.00",
            },
          ],
        }

        mockRepository.getOrderWithOrderItems.mockResolvedValue(order)

        const result = await orderService.getOrderWithOrderItems(order.id)

        expect(result).toBeDefined()
        expect(result).toEqual(order)
        expect(result).toMatchObject(order)
        expect(Array.isArray(result)).toBe(false)
        expect(Array.isArray(result.orderItems)).toBe(true)

        expect(mockRepository.getOrderWithOrderItems).toHaveBeenCalled()
        expect(mockRepository.getOrderWithOrderItems).toHaveBeenCalledWith(
          order.id,
        )
        expect(mockRepository.getOrderWithOrderItems).toHaveBeenCalledTimes(1)

        expect(mockRepository.update).not.toHaveBeenCalled()
        expect(mockRepository.create).not.toHaveBeenCalled()
        expect(mockRepository.softDelete).not.toHaveBeenCalled()
      })
    })
  })

  describe("updatePartial()", () => {
    describe("Success case", () => {
      test("should update and return order", async () => {
        const existingOrder = {
          id: 1,
          userId: 1,
          status: "PENDENTE",
          addressId: 1,
          shippingAddress: {
            userId: 1,
            label: "loja",
            street: "Rua Zé Silva Souza Soares Santos",
            number: 2,
            neighborhood: "Jardim de cactos",
            city: "Jacareí",
            state: "SP",
            zipCode: "987.654-32",
            isDefault: true,
          },
          total: "135999.99",
          createdBy: 1,
          updatedBy: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
          deletedBy: null,
        }

        const updateData: UpdateOrderPartialServiceInput = {
          total: "150000.00",
          updatedBy: 1,
        }

        const updatedOrder = {
          ...existingOrder,
          ...updateData,
        }

        mockRepository.getById.mockResolvedValue(existingOrder)
        mockRepository.update.mockResolvedValue(updatedOrder)

        const result = await orderService.updatePartial(1, updateData)

        expect(result).toEqual(updatedOrder)
        expect(mockRepository.getById).toHaveBeenCalledWith(1)
        expect(mockRepository.update).toHaveBeenCalledWith(1, updateData)

        expect(mockRepository.create).not.toHaveBeenCalled()
        expect(mockRepository.softDelete).not.toHaveBeenCalled()
      })

      test("should update order status and return order (approved status case)", async () => {
        const existingOrder = {
          id: 1,
          userId: 1,
          status: "APROVADO",
          addressId: 1,
          shippingAddress: {
            userId: 1,
            label: "loja",
            street: "Rua Zé Silva Souza Soares Santos",
            number: 2,
            neighborhood: "Jardim de cactos",
            city: "Jacareí",
            state: "SP",
            zipCode: "987.654-32",
            isDefault: true,
          },
          total: "135999.99",
          createdBy: 1,
          updatedBy: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
          deletedBy: null,
        }

        const updateData: UpdateOrderPartialServiceInput = {
          status: "CANCELADO",
          updatedBy: 1,
        }

        const updatedOrder = {
          ...existingOrder,
          ...updateData,
        }

        mockRepository.getById.mockResolvedValue(existingOrder)
        mockRepository.updateStatus.mockResolvedValue(updatedOrder)

        const result = await orderService.updatePartial(1, updateData)

        expect(result).toEqual(updatedOrder)

        expect(mockRepository.getById).toHaveBeenCalledWith(1)
        expect(mockRepository.updateStatus).toHaveBeenCalledWith(
          1,
          updateData.status,
        )

        expect(mockRepository.update).not.toHaveBeenCalled()
        expect(mockRepository.create).not.toHaveBeenCalled()
        expect(mockRepository.softDelete).not.toHaveBeenCalled()
      })

      test("should update order status and return order (sent status case)", async () => {
        const existingOrder = {
          id: 1,
          userId: 1,
          status: "ENVIADO",
          addressId: 1,
          shippingAddress: {
            userId: 1,
            label: "loja",
            street: "Rua Zé Silva Souza Soares Santos",
            number: 2,
            neighborhood: "Jardim de cactos",
            city: "Jacareí",
            state: "SP",
            zipCode: "987.654-32",
            isDefault: true,
          },
          total: "135999.99",
          createdBy: 1,
          updatedBy: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
          deletedBy: null,
        }

        const updateData: UpdateOrderPartialServiceInput = {
          status: "CANCELADO",
          updatedBy: 1,
        }

        const updatedOrder = {
          ...existingOrder,
          ...updateData,
        }

        mockRepository.getById.mockResolvedValue(existingOrder)
        mockRepository.updateStatus.mockResolvedValue(updatedOrder)

        const result = await orderService.updatePartial(1, updateData)

        expect(result).toEqual(updatedOrder)

        expect(mockRepository.getById).toHaveBeenCalledWith(1)
        expect(mockRepository.updateStatus).toHaveBeenCalledWith(
          1,
          updateData.status,
        )

        expect(mockRepository.update).not.toHaveBeenCalled()
        expect(mockRepository.create).not.toHaveBeenCalled()
        expect(mockRepository.softDelete).not.toHaveBeenCalled()
      })
    })

    describe("Error cases", () => {
      test("should throw 403 when order status is cancelled", async () => {
        const existingOrder = {
          id: 1,
          userId: 1,
          status: "CANCELADO",
          addressId: 1,
          shippingAddress: {
            userId: 1,
            label: "loja",
            street: "Rua Zé Silva Souza Soares Santos",
            number: 2,
            neighborhood: "Jardim de cactos",
            city: "Jacareí",
            state: "SP",
            zipCode: "987.654-32",
            isDefault: true,
          },
          total: "135999.99",
          createdBy: 1,
          updatedBy: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
          deletedBy: null,
        }

        const updateData: UpdateOrderPartialServiceInput = {
          status: "PENDENTE",
          total: "10.00",
          updatedBy: 1,
        }

        mockRepository.getById.mockResolvedValue(existingOrder)

        await expect(orderService.updatePartial(1, updateData)).rejects.toThrow(
          HttpError,
        )
        await expect(orderService.updatePartial(1, updateData)).rejects.toThrow(
          "Not allowed change order after cancelled",
        )

        expect(mockRepository.update).not.toHaveBeenCalled()
        expect(mockRepository.updateStatus).not.toHaveBeenCalled()
      })
    })
  })

  describe("delete()", () => {
    describe("Success cases", () => {
      test("should soft delete order", async () => {
        const order = {
          id: 1,
          userId: 1,
          status: "CANCELADO",
          addressId: 1,
          shippingAddress: {
            userId: 1,
            label: "loja",
            street: "Rua Zé Silva Souza Soares Santos",
            number: 2,
            neighborhood: "Jardim de cactos",
            city: "Jacareí",
            state: "SP",
            zipCode: "987.654-32",
            isDefault: true,
          },
          total: "135999.99",
          createdBy: 1,
          updatedBy: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
          deletedBy: null,
        }

        mockRepository.getById.mockResolvedValue(order)
        mockRepository.softDelete.mockResolvedValue(undefined)

        const result = await orderService.delete(1, 1)

        expect(result).toBeUndefined()
        expect(mockRepository.getById).toHaveBeenCalledWith(1)
        expect(mockRepository.softDelete).toBeCalledWith(1, 1)
        expect(mockRepository.softDelete).toBeCalledTimes(1)

        expect(mockRepository.create).not.toHaveBeenCalled()
        expect(mockRepository.update).not.toHaveBeenCalled()
        expect(mockRepository.updateStatus).not.toHaveBeenCalled()
      })
    })

    describe("Error cases", () => {
      test("should throw 404 when order not found", async () => {
        mockRepository.getById.mockResolvedValue(null)

        await expect(orderService.delete(999, 1)).rejects.toThrow(HttpError)
        await expect(orderService.delete(999, 1)).rejects.toThrow("Not found")

        expect(mockRepository.softDelete).not.toHaveBeenCalled()
      })
    })
  })
})
