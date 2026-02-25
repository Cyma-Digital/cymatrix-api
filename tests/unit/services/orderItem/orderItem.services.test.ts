import { OrderItemService } from "@/services/orderItem/orderItem.service"
import { HttpError } from "@/errors/httpError"
import {
  CreateOrderItemServiceSchemaInput,
  UpdateOrderItemPartialServiceInput,
} from "@/schemas/orderItem/orderItem.schemas"

const mockRepository = {
  create: vi.fn(),
  listAll: vi.fn(),
  getById: vi.fn(),
  getByUserId: vi.fn(),
  update: vi.fn(),
  softDelete: vi.fn(),
}

const mockOrderRepository = {
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

const mockProductRepository = {
  create: vi.fn(),
  listAll: vi.fn(),
  getById: vi.fn(),
  update: vi.fn(),
  softDelete: vi.fn(),
}

describe("@services/OrderItemService", () => {
  let orderItemService: OrderItemService

  beforeEach(() => {
    vi.clearAllMocks()
    orderItemService = new OrderItemService(
      mockRepository,
      mockOrderRepository,
      mockProductRepository,
    )
  })

  describe("create()", () => {
    describe("Success cases", () => {
      describe("order status pendent", () => {
        describe("order item and order already exist", () => {
          test("Should create and return order item", async () => {
            const order = {
              id: 1,
              userId: 1,
              status: "PENDENTE",
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
              total: "135999.99",
              createdBy: 1,
              updatedBy: 1,
              createdAt: new Date(),
              updatedAt: new Date(),
              deletedAt: null,
              deletedBy: null,
            }

            const product = {
              id: 2,
              categoryId: 1,
              brandId: 1,
              name: "cadeira customizada heineken",
              price: "209.99",
              description: "cadeira customizada com o log da heineken",
              // additionalInfo: {
              //   dimentions: {
              //     width: 50,
              //     height: 100,
              //     thickness: 5,
              //   },
              //   warranty: 12,
              //   material: "madeira",
              //   madeAt: "2026-02-04T16:40:23.130Z",
              // },
              avaliable: true,
              imageUrl: "https://example.com/chairs.png",
              createdBy: 1,
              updatedBy: 1,
              createdAt: new Date(),
              updatedAt: new Date(),
              deletedAt: null,
              deletedBy: null,
            }

            const existentOrderItem = {
              id: 1,
              orderId: 1,
              productId: 1,
              quantity: 10,
              unitPrice: "209.99",
              createdBy: 1,
              updatedBy: 1,
              createdAt: new Date(),
              updatedAt: new Date(),
              deletedAt: null,
              deletedBy: null,
            }

            const input: CreateOrderItemServiceSchemaInput = {
              orderId: 1,
              productId: 2,
              quantity: 10,
              unitPrice: "209.99",
              createdBy: 1,
              updatedBy: 1,
            }

            const expectedOrderItem = {
              id: 1,
              ...input,
              createdAt: new Date(),
              updatedAt: new Date(),
              deletedAt: null,
              deletedBy: null,
            }

            mockProductRepository.getById.mockResolvedValue(product)
            mockRepository.getByUserId.mockResolvedValue(existentOrderItem)
            mockRepository.create.mockResolvedValue(expectedOrderItem)
            mockOrderRepository.getPendentOrderStatus.mockResolvedValue(order)
            mockRepository.getById.mockResolvedValue(expectedOrderItem)

            const result = await orderItemService.create(input, 1)

            expect(result).toBeDefined()
            expect(result!.id).toBeDefined()
            expect(result).toMatchObject(input)
            expect(result!.id).toBeTypeOf("number")
            expect(result!.orderId).toBeTypeOf("number")
            expect(result!.productId).toBeTypeOf("number")
            expect(result!.quantity).toBeTypeOf("number")
            expect(result!.unitPrice).toBeTypeOf("string")
            expect(result!.createdAt).toBeInstanceOf(Date)

            expect(mockRepository.create).toHaveBeenCalled()
            expect(mockRepository.create).toHaveBeenCalledWith(input)
            expect(mockRepository.create).toHaveBeenCalledTimes(1)
            expect(mockRepository.update).toHaveBeenCalled()

            expect(mockRepository.softDelete).not.toHaveBeenCalled()

            expect(mockOrderRepository.getPendentOrderStatus).toHaveBeenCalled()
            expect(mockOrderRepository.update).toHaveBeenCalled()
            expect(mockProductRepository.getById).toHaveBeenCalled()
          })
        })

        test("should create and return order item (order not exist)", async () => {
          const product = {
            id: 1,
            categoryId: 1,
            brandId: 1,
            name: "cadeira customizada heineken",
            price: "209.99",
            description: "cadeira customizada com o log da heineken",
            // additionalInfo: {
            //   dimentions: {
            //     width: 50,
            //     height: 100,
            //     thickness: 5,
            //   },
            //   warranty: 12,
            //   material: "madeira",
            //   madeAt: "2026-02-04T16:40:23.130Z",
            // },
            avaliable: true,
            imageUrl: "https://example.com/chairs.png",
            createdBy: 1,
            updatedBy: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
            deletedBy: null,
          }

          const input: CreateOrderItemServiceSchemaInput = {
            productId: 1,
            quantity: 10,
            unitPrice: "209.99",
            createdBy: 1,
            updatedBy: 1,
          }

          const expectedOrderItem = {
            id: 1,
            orderId: 1,
            ...input,
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
            deletedBy: null,
          }

          const order = {
            userId: 1,
            status: "PENDENTE",
            addressId: 1,
            shippingAddress: {
              userId: 1,
              label: "indústria",
              street: "Rua Zeca Silva Souza Soares Santos",
              number: 234,
              complement: "segundo prédio",
              neighborhood: "Jardim das fábricas",
              city: "Jacareí",
              state: "SP",
              zipCode: "321.456-87",
              isDefault: true,
            },
            total: "0",
            createdBy: 1,
            updatedBy: 1,
          }

          mockProductRepository.getById.mockResolvedValue(product)
          mockRepository.getByUserId.mockResolvedValue(null)
          mockRepository.create.mockResolvedValue(expectedOrderItem)
          // mockOrderRepository.getById.mockResolvedValue(null)
          mockOrderRepository.create.mockResolvedValue(order)
          mockRepository.getById.mockResolvedValue(expectedOrderItem)

          const result = await orderItemService.create(input, 1)

          expect(result).toBeDefined()
          expect(result!.id).toBeDefined()
          expect(result).toMatchObject(input)
          expect(result!.id).toBeTypeOf("number")
          expect(result!.orderId).toBeTypeOf("number")
          expect(result!.productId).toBeTypeOf("number")
          expect(result!.quantity).toBeTypeOf("number")
          expect(result!.unitPrice).toBeTypeOf("string")
          expect(result!.createdAt).toBeInstanceOf(Date)

          expect(mockOrderRepository.create).toHaveBeenCalled()
          expect(mockOrderRepository.create).toHaveBeenCalledTimes(1)

          expect(mockRepository.create).toHaveBeenCalled()
          expect(mockRepository.getByUserId).toHaveBeenCalled()

          expect(mockRepository.update).toHaveBeenCalled()
          expect(mockRepository.getById).toHaveBeenCalled()
        })
      })

      describe("order status approved, sent or cancelled", () => {
        test("should create and return order item (create new order)", async () => {
          const order = {
            id: 1,
            userId: 1,
            status: "PENDENTE",
            addressId: 1,
            shippingAddress: {
              userId: 1,
              label: "indústria",
              street: "Rua Zeca Silva Souza Soares Santos",
              number: 234,
              complement: "segundo prédio",
              neighborhood: "Jardim das fábricas",
              city: "Jacareí",
              state: "SP",
              zipCode: "321.456-87",
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

          const product = {
            id: 2,
            categoryId: 1,
            brandId: 1,
            name: "cadeira customizada heineken",
            price: "209.99",
            description: "cadeira customizada com o log da heineken",
            // additionalInfo: {
            //   dimentions: {
            //     width: 50,
            //     height: 100,
            //     thickness: 5,
            //   },
            //   warranty: 12,
            //   material: "madeira",
            //   madeAt: "2026-02-04T16:40:23.130Z",
            // },
            avaliable: true,
            imageUrl: "https://example.com/chairs.png",
            createdBy: 1,
            updatedBy: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
            deletedBy: null,
          }

          const input: CreateOrderItemServiceSchemaInput = {
            productId: 1,
            quantity: 10,
            unitPrice: "209.99",
            createdBy: 1,
            updatedBy: 1,
          }

          const existentOrderItem = {
            orderId: 1,
            productId: 2,
            quantity: 10,
            unitPrice: "209.99",
            createdBy: 1,
            updatedBy: 1,
          }

          const expectedOrderItem = {
            id: 2,
            orderId: 1,
            ...input,
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
            deletedBy: null,
          }

          mockProductRepository.getById.mockResolvedValue(product)
          mockRepository.getByUserId.mockResolvedValue(existentOrderItem)
          mockRepository.create.mockResolvedValue(expectedOrderItem)
          mockOrderRepository.getPendentOrderStatus.mockResolvedValue(null)
          mockOrderRepository.create.mockResolvedValue(order)
          mockRepository.getById.mockResolvedValue(expectedOrderItem)

          const result = await orderItemService.create(input, 1)

          expect(result).toBeDefined()
          expect(result!.id).toBeDefined()
          expect(result).toMatchObject(input)
          expect(result!.id).toBeTypeOf("number")
          expect(result!.orderId).toBeTypeOf("number")
          expect(result!.productId).toBeTypeOf("number")
          expect(result!.quantity).toBeTypeOf("number")
          expect(result!.unitPrice).toBeTypeOf("string")
          expect(result!.createdAt).toBeInstanceOf(Date)

          expect(mockOrderRepository.create).toHaveBeenCalled()
          expect(mockOrderRepository.create).toHaveBeenCalledTimes(1)
          expect(mockOrderRepository.getPendentOrderStatus).toHaveBeenCalled()

          expect(mockRepository.create).toHaveBeenCalled()
          expect(mockRepository.getByUserId).toHaveBeenCalled()

          expect(mockRepository.update).toHaveBeenCalled()
          expect(mockRepository.getById).toHaveBeenCalled()
        })
      })
    })

    describe("Error cases", () => {
      test("should throw 404 when product not found", async () => {
        const input: CreateOrderItemServiceSchemaInput = {
          orderId: 1,
          productId: 1,
          quantity: 10,
          unitPrice: "209.99",
          createdBy: 1,
          updatedBy: 1,
        }

        mockProductRepository.getById.mockResolvedValue(null)

        await expect(orderItemService.create(input, 1)).rejects.toThrow(
          HttpError,
        )
        await expect(orderItemService.create(input, 1)).rejects.toThrow(
          "Product not found",
        )
      })
    })
  })

  describe("listAll()", () => {
    describe("Success cases", () => {
      test("should return all order items", async () => {
        const orderItems = [
          {
            orderId: 1,
            productId: 1,
            quantity: 10,
            unitPrice: "209.99",
            createdBy: 1,
            updatedBy: 1,
          },
          {
            orderId: 1,
            productId: 2,
            quantity: 10,
            unitPrice: "1209.99",
            createdBy: 1,
            updatedBy: 1,
          },
          {
            orderId: 1,
            productId: 3,
            quantity: 10,
            unitPrice: "2209.99",
            createdBy: 1,
            updatedBy: 1,
          },
        ]

        mockRepository.listAll.mockResolvedValue(orderItems)

        const result = await orderItemService.listAll()

        expect(result).toBeDefined()
        expect(result).toHaveLength(3)
        expect(result).toMatchObject(orderItems)
        expect(Array.isArray(result)).toBe(true)

        expect(mockRepository.listAll).toHaveBeenCalled()
        expect(mockRepository.listAll).toHaveBeenCalledWith()
        expect(mockRepository.listAll).toHaveBeenCalledTimes(1)

        expect(mockRepository.update).not.toHaveBeenCalled()
        expect(mockRepository.create).not.toHaveBeenCalled()
        expect(mockRepository.softDelete).not.toHaveBeenCalled()
      })
      test("should return empty array when no order items", async () => {
        mockRepository.listAll.mockResolvedValue([])

        const result = await orderItemService.listAll()

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
      test("should return order item when exists", async () => {
        const orderItem = {
          id: 1,
          orderId: 1,
          productId: 1,
          quantity: 10,
          unitPrice: "209.99",
          createdBy: 1,
          updatedBy: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
          deletedBy: null,
        }

        mockRepository.getById.mockResolvedValue(orderItem)

        const result = await orderItemService.getById(orderItem.id)

        expect(result).toBeDefined()
        expect(result).toEqual(orderItem)
        expect(result).toMatchObject(orderItem)
        expect(Array.isArray(result)).toBe(false)

        expect(mockRepository.getById).toHaveBeenCalled()
        expect(mockRepository.getById).toHaveBeenCalledWith(orderItem.id)
        expect(mockRepository.getById).toHaveBeenCalledTimes(1)

        expect(mockRepository.update).not.toHaveBeenCalled()
        expect(mockRepository.create).not.toHaveBeenCalled()
        expect(mockRepository.softDelete).not.toHaveBeenCalled()
      })
    })
  })

  describe("updatePartial()", () => {
    describe("Success case", () => {
      test("should update and return order item", async () => {
        const existingOrderItem = {
          id: 1,
          orderId: 1,
          productId: 1,
          quantity: 10,
          unitPrice: "209.99",
          createdBy: 1,
          updatedBy: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
          deletedBy: null,
        }

        const updateData: UpdateOrderItemPartialServiceInput = {
          quantity: 2,
          unitPrice: "889.99",
          updatedBy: 1,
        }

        const updatedOrderItem = {
          ...existingOrderItem,
          ...updateData,
        }

        mockRepository.getById.mockResolvedValue(existingOrderItem)
        mockRepository.update.mockResolvedValue(updatedOrderItem)

        const result = await orderItemService.updatePartial(1, updateData)

        expect(result).toEqual(updatedOrderItem)
        expect(mockRepository.getById).toHaveBeenCalledWith(1)
        expect(mockRepository.update).toHaveBeenCalledWith(1, updateData)

        expect(mockRepository.create).not.toHaveBeenCalled()
        expect(mockRepository.softDelete).not.toHaveBeenCalled()
      })
    })

    describe("Error cases", () => {
      test("should throw 404 when order not found", async () => {
        const existingOrderItem = {
          id: 1,
          orderId: 1,
          productId: 1,
          quantity: 10,
          unitPrice: "209.99",
          createdBy: 1,
          updatedBy: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
          deletedBy: null,
        }

        const updateData: UpdateOrderItemPartialServiceInput = {
          orderId: 2,
          updatedBy: 1,
        }

        mockRepository.getById.mockResolvedValue(existingOrderItem)
        mockOrderRepository.getById.mockResolvedValue(null)

        await expect(
          orderItemService.updatePartial(1, updateData),
        ).rejects.toThrow(HttpError)
        await expect(
          orderItemService.updatePartial(1, updateData),
        ).rejects.toThrow("Order not found")
      })

      test("should throw 404 when product not found", async () => {
        const existingOrderItem = {
          id: 1,
          orderId: 1,
          productId: 1,
          quantity: 10,
          unitPrice: "209.99",
          createdBy: 1,
          updatedBy: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
          deletedBy: null,
        }

        const updateData: UpdateOrderItemPartialServiceInput = {
          productId: 2,
          updatedBy: 1,
        }

        mockRepository.getById.mockResolvedValue(existingOrderItem)
        mockProductRepository.getById.mockResolvedValue(null)

        await expect(
          orderItemService.updatePartial(1, updateData),
        ).rejects.toThrow(HttpError)
        await expect(
          orderItemService.updatePartial(1, updateData),
        ).rejects.toThrow("Product not found")
      })
    })
  })

  describe("delete()", () => {
    describe("Success cases", () => {
      test("should soft delete order item", async () => {
        const orderItem = {
          id: 1,
          orderId: 1,
          productId: 1,
          quantity: 10,
          unitPrice: "209.99",
          createdBy: 1,
          updatedBy: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
          deletedBy: null,
        }

        mockRepository.getById.mockResolvedValue(orderItem)
        mockRepository.softDelete.mockResolvedValue(undefined)

        const result = await orderItemService.delete(1, 1)

        expect(result).toBeUndefined()
        expect(mockRepository.getById).toHaveBeenCalledWith(1)
        expect(mockRepository.softDelete).toBeCalledWith(1, 1)
        expect(mockRepository.softDelete).toBeCalledTimes(1)

        expect(mockRepository.create).not.toHaveBeenCalled()
        expect(mockRepository.update).not.toHaveBeenCalled()
      })
    })

    describe("Error cases", () => {
      test("should throw 404 when order item not found", async () => {
        mockRepository.getById.mockResolvedValue(null)

        await expect(orderItemService.delete(999, 1)).rejects.toThrow(HttpError)
        await expect(orderItemService.delete(999, 1)).rejects.toThrow(
          "Not found",
        )

        expect(mockRepository.softDelete).not.toHaveBeenCalled()
      })
    })
  })
})
