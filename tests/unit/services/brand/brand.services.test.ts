import { BrandService } from "@/services/brand/brand.service"
// import { HttpError } from "@/errors/httpError"
import type { CreateBrandData } from "@/repositories/brand/brand.repository"

const mockRepository = {
  create: vi.fn(),
  listAll: vi.fn(),
  getById: vi.fn(),
  update: vi.fn(),
  softDelete: vi.fn(),
}

describe("@services/BrandService", () => {
  let brandService: BrandService

  beforeEach(() => {
    vi.clearAllMocks()
    brandService = new BrandService(mockRepository)
  })

  describe("create()", () => {
    describe("Success cases", () => {
      test("should create and return brand", async () => {
        const input: CreateBrandData = {
          name: "Heineken",
          slug: "heineken",
          logoUrl: "medias/hnk.png",
          createdBy: 1,
          updatedBy: 1,
        }

        const expectedBrand = {
          id: 1,
          ...input,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
          deletedBy: null,
        }

        mockRepository.create.mockResolvedValue(expectedBrand)

        const result = await brandService.create(input)

        expect(result).toBeDefined()
        expect(result.id).toBeDefined()
        expect(result).toMatchObject(input)
        expect(result).toEqual(expectedBrand)
        expect(result.id).toBeTypeOf("number")
        expect(result.createdAt).toBeInstanceOf(Date)

        expect(mockRepository.create).toHaveBeenCalled()
        expect(mockRepository.create).toHaveBeenCalledWith(input)
        expect(mockRepository.create).toHaveBeenCalledTimes(1)

        expect(mockRepository.update).not.toHaveBeenCalled()
        expect(mockRepository.softDelete).not.toHaveBeenCalled()
      })
    })
  })
})
