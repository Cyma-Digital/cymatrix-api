import { ProductService } from "@/services/product/product.service"
import { HttpError } from "@/errors/httpError"
import {
  CreateProductServiceSchemaInput,
  UpdateProductPartialServiceInput,
} from "@/schemas/product/product.schemas"

const mockRepository = {
  create: vi.fn(),
  listAll: vi.fn(),
  getById: vi.fn(),
  update: vi.fn(),
  softDelete: vi.fn(),
}

const mockBrandRepository = {
  create: vi.fn(),
  listAll: vi.fn(),
  getById: vi.fn(),
  update: vi.fn(),
  softDelete: vi.fn(),
}

const mockCategoryRepository = {
  create: vi.fn(),
  listAll: vi.fn(),
  getById: vi.fn(),
  update: vi.fn(),
  softDelete: vi.fn(),
}

describe("@services/ProductService", () => {
  let productService: ProductService

  beforeEach(() => {
    vi.clearAllMocks()
    productService = new ProductService(
      mockRepository,
      mockBrandRepository,
      mockCategoryRepository,
    )
  })

  describe("create()", () => {
    describe("Success cases", () => {
      test("Should create and return product", async () => {
        const category = {
          id: 1,
          name: "Mesas",
          slug: "mesas",
          iconUrl: "https://example.com/table.png",
          createdBy: 1,
          updatedBy: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
          deletedBy: null,
        }

        const brand = {
          id: 1,
          name: "Heineken",
          slug: "heineken",
          logoUrl: "https://example.com/heineken.png",
          createdBy: 1,
          updatedBy: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
          deletedBy: null,
        }

        const input: CreateProductServiceSchemaInput = {
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
        }

        const expectedProduct = {
          id: 1,
          ...input,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
          deletedBy: null,
        }

        mockRepository.create.mockResolvedValue(expectedProduct)

        mockBrandRepository.getById.mockResolvedValue(brand)
        mockCategoryRepository.getById.mockResolvedValue(category)

        const result = await productService.create(input)

        expect(result).toBeDefined()
        expect(result.id).toBeDefined()
        expect(result).toMatchObject(input)
        expect(result).toEqual(expectedProduct)
        expect(result.id).toBeTypeOf("number")
        expect(result.categoryId).toBeTypeOf("number")
        expect(result.brandId).toBeTypeOf("number")
        expect(result.price).toBeTypeOf("string")
        expect(result.createdAt).toBeInstanceOf(Date)

        expect(mockRepository.create).toHaveBeenCalled()
        expect(mockRepository.create).toHaveBeenCalledWith(input)
        expect(mockRepository.create).toHaveBeenCalledTimes(1)

        expect(mockRepository.update).not.toHaveBeenCalled()
        expect(mockRepository.softDelete).not.toHaveBeenCalled()

        expect(mockBrandRepository.getById).toHaveBeenCalled()
        expect(mockCategoryRepository.getById).toHaveBeenCalled()
      })
    })
  })

  describe("listAll()", () => {
    describe("Success cases", () => {
      test("should return all products", async () => {
        const products = [
          {
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
          },
          {
            categoryId: 1,
            brandId: 1,
            name: "mesa customizada heineken",
            price: "2209.99",
            description: "mesa customizada com o log da heineken",
            // additionalInfo: {
            //   dimentions: {
            //     width: 80,
            //     height: 100,
            //     thickness: 5,
            //   },
            //   warranty: 12,
            //   material: "madeira",
            //   madeAt: "2026-02-04T16:40:23.130Z",
            // },
            avaliable: true,
            imageUrl: "https://example.com/table.png",
            createdBy: 1,
            updatedBy: 1,
          },
          {
            categoryId: 1,
            brandId: 1,
            name: "geladeira customizada heineken",
            price: "8209.99",
            description: "geladeira customizada com o log da heineken",
            // additionalInfo: {
            //   dimentions: {
            //     width: 80,
            //     height: 180,
            //   },
            //   warranty: 12,
            //   madeAt: "2026-02-04T16:40:23.130Z",
            // },
            avaliable: false,
            imageUrl: "https://example.com/fridge.png",
            createdBy: 1,
            updatedBy: 1,
          },
        ]

        mockRepository.listAll.mockResolvedValue(products)

        const result = await productService.listAll()

        expect(result).toBeDefined()
        expect(result).toHaveLength(3)
        expect(result).toMatchObject(products)
        expect(Array.isArray(result)).toBe(true)

        expect(mockRepository.listAll).toHaveBeenCalled()
        expect(mockRepository.listAll).toHaveBeenCalledWith()
        expect(mockRepository.listAll).toHaveBeenCalledTimes(1)

        expect(mockRepository.update).not.toHaveBeenCalled()
        expect(mockRepository.create).not.toHaveBeenCalled()
        expect(mockRepository.softDelete).not.toHaveBeenCalled()
      })

      test("should return empty array when no products", async () => {
        mockRepository.listAll.mockResolvedValue([])

        const result = await productService.listAll()

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
      test("should return product when exists", async () => {
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

        mockRepository.getById.mockResolvedValue(product)

        const result = await productService.getById(product.id)

        expect(result).toBeDefined()
        expect(result).toEqual(product)
        expect(result).toMatchObject(product)
        expect(Array.isArray(result)).toBe(false)

        expect(mockRepository.getById).toHaveBeenCalled()
        expect(mockRepository.getById).toHaveBeenCalledWith(product.id)
        expect(mockRepository.getById).toHaveBeenCalledTimes(1)

        expect(mockRepository.update).not.toHaveBeenCalled()
        expect(mockRepository.create).not.toHaveBeenCalled()
        expect(mockRepository.softDelete).not.toHaveBeenCalled()
      })
    })
  })

  describe("updatePartial()", () => {
    describe("Success case", () => {
      test("should update and return product", async () => {
        const existingProduct = {
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

        const updateData: UpdateProductPartialServiceInput = {
          name: "cadeira heineken",
          avaliable: false,
          updatedBy: 1,
        }

        const updatedProduct = {
          ...existingProduct,
          ...updateData,
        }

        mockRepository.getById.mockResolvedValue(existingProduct)
        mockRepository.update.mockResolvedValue(updatedProduct)

        const result = await productService.updatePartial(1, updateData)

        expect(result).toEqual(updatedProduct)
        expect(mockRepository.getById).toHaveBeenCalledWith(1)
        expect(mockRepository.update).toHaveBeenCalledWith(1, updateData)

        expect(mockRepository.create).not.toHaveBeenCalled()
        expect(mockRepository.softDelete).not.toHaveBeenCalled()
      })
    })
  })

  describe("delete()", () => {
    describe("Success cases", () => {
      test("should soft delete product", async () => {
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

        mockRepository.getById.mockResolvedValue(product)
        mockRepository.softDelete.mockResolvedValue(undefined)

        const result = await productService.delete(1, 1)

        expect(result).toBeUndefined()
        expect(mockRepository.getById).toHaveBeenCalledWith(1)
        expect(mockRepository.softDelete).toBeCalledWith(1, 1)
        expect(mockRepository.softDelete).toBeCalledTimes(1)

        expect(mockRepository.create).not.toHaveBeenCalled()
        expect(mockRepository.update).not.toHaveBeenCalled()
      })
    })

    describe("Error cases", () => {
      test("should throw 404 when product not found", async () => {
        mockRepository.getById.mockResolvedValue(null)

        await expect(productService.delete(999, 1)).rejects.toThrow(HttpError)
        await expect(productService.delete(999, 1)).rejects.toThrow("Not found")

        expect(mockRepository.softDelete).not.toHaveBeenCalled()
      })
    })
  })
})
