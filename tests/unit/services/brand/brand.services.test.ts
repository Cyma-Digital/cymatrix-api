import { BrandService } from "@/services/brand/brand.service"
import { HttpError } from "@/errors/httpError"
import type {
  CreateBrandData,
  BrandUpdatedData,
} from "@/repositories/brand/brand.repository"
import { UpdateBrandPartialServiceInput } from "@/schemas/brand/brand.schemas"

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
          logoUrl: "https://example.com/heineken.png",
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

  describe("listAll()", () => {
    describe("Success cases", () => {
      test("should return all brands", async () => {
        const brands = [
          {
            name: "Heineken",
            slug: "heineken",
            logoUrl: "https://example.com/heineken.png",
            createdBy: 1,
            updatedBy: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
            deletedBy: null,
          },
          {
            name: "Eisenbahn",
            slug: "eisenbahn",
            logoUrl: "https://example.com/eisenbahn.png",
            createdBy: 1,
            updatedBy: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
            deletedBy: null,
          },
          {
            name: "Lagunitas",
            slug: "lagunitas",
            logoUrl: "https://example.com/lagunitas.png",
            createdBy: 1,
            updatedBy: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
            deletedBy: null,
          },
        ]

        mockRepository.listAll.mockResolvedValue(brands)

        const result = await brandService.listAll()

        expect(result).toBeDefined()
        expect(result).toHaveLength(3)
        expect(result).toMatchObject(brands)
        expect(Array.isArray(result)).toBe(true)

        expect(mockRepository.listAll).toHaveBeenCalled()
        expect(mockRepository.listAll).toHaveBeenCalledWith()
        expect(mockRepository.listAll).toHaveBeenCalledTimes(1)

        expect(mockRepository.update).not.toHaveBeenCalled()
        expect(mockRepository.create).not.toHaveBeenCalled()
        expect(mockRepository.softDelete).not.toHaveBeenCalled()
      })

      test("should return empty array when no brands", async () => {
        mockRepository.listAll.mockResolvedValue([])

        const result = await brandService.listAll()

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
      test("should return brand when existis", async () => {
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

        mockRepository.getById.mockResolvedValue(brand)

        const result = await brandService.getById(brand.id)

        expect(result).toBeDefined()
        expect(result).toEqual(brand)
        expect(result).toMatchObject(brand)
        expect(Array.isArray(result)).toBe(false)

        expect(mockRepository.getById).toHaveBeenCalled()
        expect(mockRepository.getById).toHaveBeenCalledWith(brand.id)
        expect(mockRepository.getById).toHaveBeenCalledTimes(1)

        expect(mockRepository.update).not.toHaveBeenCalled()
        expect(mockRepository.create).not.toHaveBeenCalled()
        expect(mockRepository.softDelete).not.toHaveBeenCalled()
      })
    })
  })

  describe("updatePartial()", () => {
    describe("Success case", () => {
      test("should update and return brand", async () => {
        const existingBrand = {
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

        const updateData: UpdateBrandPartialServiceInput = {
          name: "Heineken 0.0",
          slug: "heineken00",
          updatedBy: 1,
        }

        const updatedBrand = {
          ...existingBrand,
          ...updateData,
        }

        mockRepository.getById.mockResolvedValue(existingBrand)
        mockRepository.update.mockResolvedValue(updatedBrand)

        const result = await brandService.updatePartial(1, updateData)

        expect(result).toEqual(updatedBrand)
        expect(mockRepository.getById).toHaveBeenCalledWith(1)
        expect(mockRepository.update).toHaveBeenCalledWith(1, updateData)

        expect(mockRepository.create).not.toHaveBeenCalled()
        expect(mockRepository.softDelete).not.toHaveBeenCalled()
      })
    })
  })

  describe("delete()", () => {
    describe("Success cases", () => {
      test("should soft delete brand", async () => {
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

        mockRepository.getById.mockResolvedValue(brand)
        mockRepository.softDelete.mockResolvedValue(undefined)

        const result = await brandService.delete(1, 1)

        expect(result).toBeUndefined()
        expect(mockRepository.getById).toHaveBeenCalledWith(1)
        expect(mockRepository.softDelete).toBeCalledWith(1, 1)
        expect(mockRepository.softDelete).toBeCalledTimes(1)

        expect(mockRepository.create).not.toHaveBeenCalled()
        expect(mockRepository.update).not.toHaveBeenCalled()
      })
    })

    describe("Error cases", () => {
      test("should throw 404 when brand not found", async () => {
        mockRepository.getById.mockResolvedValue(null)

        await expect(brandService.delete(999, 1)).rejects.toThrow(HttpError)
        await expect(brandService.delete(999, 1)).rejects.toThrow("Not found")

        expect(mockRepository.softDelete).not.toHaveBeenCalled()
      })
    })
  })
})
