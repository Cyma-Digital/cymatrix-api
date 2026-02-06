import { ProductService } from "@/services/product/product.service"
import { HttpError } from "@/errors/httpError"
import type {
  CreateProductData,
  ProductUpdatedData,
} from "@/repositories/product/product.repository"

const mockRepository = {
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
    productService = new ProductService(mockRepository)
  })

  describe("create()", () => {
    describe("Success cases", () => {
      test("Should create and return product", async () => {
        const input: CreateProductData = {
          categoryId: 1,
          brandId: 1,
          name: "cadeira customizada heineken",
          price: "209.99",
          description: "cadeira customizada com o log da heineken",
          additionalInfo: {
            dimentions: {
              width: 50,
              height: 100,
              thickness: 5,
            },
            warranty: 12,
            material: "madeira",
            madeAt: "2026-02-04T16:40:23.130Z",
          },
          avaliable: true,
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
      })
    })
  })
})
