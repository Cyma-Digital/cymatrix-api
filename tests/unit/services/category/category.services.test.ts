import { CategoryService } from "@/services/category/category.service"
import { HttpError } from "@/errors/httpError"
import {
  CreateCategoryServiceSchemaInput,
  UpdateCategoryPartialServiceInput,
} from "@/schemas/category/category.schemas"

const mockRepository = {
  create: vi.fn(),
  listAll: vi.fn(),
  getById: vi.fn(),
  update: vi.fn(),
  softDelete: vi.fn(),
}

describe("@services/CategoryService", () => {
  let categoryService: CategoryService

  beforeEach(() => {
    vi.clearAllMocks()
    categoryService = new CategoryService(mockRepository)
  })

  describe("create()", () => {
    describe("Success cases", () => {
      test("Should create and return category", async () => {
        const input: CreateCategoryServiceSchemaInput = {
          name: "Mesa",
          slug: "mesa",
          iconUrl: "https://example.com/table.png",
          createdBy: 1,
          updatedBy: 1,
        }

        const expectedCategory = {
          id: 1,
          ...input,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
          deletedBy: null,
        }

        mockRepository.create.mockResolvedValue(expectedCategory)

        const result = await categoryService.create(input)

        expect(result).toBeDefined()
        expect(result.id).toBeDefined()
        expect(result).toMatchObject(input)
        expect(result).toEqual(expectedCategory)
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
      test("Should return all categories", async () => {
        const categories = [
          {
            name: "Mesas",
            slug: "mesas",
            iconUrl: "https://example.com/table.png",
            createdBy: 1,
            updatedBy: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
            deletedBy: null,
          },
          {
            name: "Cadeiras",
            slug: "cadeiras",
            iconUrl: "https://example.com/chairs.png",
            createdBy: 1,
            updatedBy: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
            deletedBy: null,
          },
          {
            name: "Geladeiras",
            slug: "geladeiras",
            iconUrl: "https://example.com/fridge.png",
            createdBy: 1,
            updatedBy: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
            deletedBy: null,
          },
        ]

        mockRepository.listAll.mockResolvedValue(categories)

        const result = await categoryService.listAll()

        expect(result).toBeDefined()
        expect(result).toHaveLength(3)
        expect(result).toMatchObject(categories)
        expect(Array.isArray(result)).toBe(true)

        expect(mockRepository.listAll).toHaveBeenCalled()
        expect(mockRepository.listAll).toHaveBeenCalledWith()
        expect(mockRepository.listAll).toHaveBeenCalledTimes(1)

        expect(mockRepository.update).not.toHaveBeenCalled()
        expect(mockRepository.create).not.toHaveBeenCalled()
        expect(mockRepository.softDelete).not.toHaveBeenCalled()
      })

      test("Should return empty array when no categories", async () => {
        mockRepository.listAll.mockResolvedValue([])

        const result = await categoryService.listAll()

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
      test("Should return category when exists", async () => {
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

        mockRepository.getById.mockResolvedValue(category)

        const result = await categoryService.getById(category.id)

        expect(result).toBeDefined()
        expect(result).toEqual(category)
        expect(result).toMatchObject(category)
        expect(Array.isArray(result)).toBe(false)

        expect(mockRepository.getById).toHaveBeenCalled()
        expect(mockRepository.getById).toHaveBeenCalledWith(category.id)
        expect(mockRepository.getById).toHaveBeenCalledTimes(1)

        expect(mockRepository.update).not.toHaveBeenCalled()
        expect(mockRepository.create).not.toHaveBeenCalled()
        expect(mockRepository.softDelete).not.toHaveBeenCalled()
      })
    })
  })

  describe("updatePartial()", () => {
    describe("Success cases", () => {
      test("Should update and return category", async () => {
        const existingCategory = {
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

        const updateData: UpdateCategoryPartialServiceInput = {
          name: "Mesas customizadas",
          slug: "mesas-customizadas",
          updatedBy: 1,
        }

        const updatedCategory = {
          ...existingCategory,
          ...updateData,
        }

        mockRepository.getById.mockResolvedValue(existingCategory)
        mockRepository.update.mockResolvedValue(updatedCategory)

        const result = await categoryService.updatePartial(1, updateData)

        expect(result).toEqual(updatedCategory)
        expect(mockRepository.getById).toHaveBeenCalledWith(1)
        expect(mockRepository.update).toHaveBeenCalledWith(1, updateData)

        expect(mockRepository.create).not.toHaveBeenCalled()
        expect(mockRepository.softDelete).not.toHaveBeenCalled()
      })
    })
  })

  describe("delete()", () => {
    describe("Success cases", () => {
      test("Should soft delete category", async () => {
        const category = {
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

        mockRepository.getById.mockResolvedValue(category)
        mockRepository.softDelete.mockResolvedValue(undefined)

        const result = await categoryService.delete(1, 1)

        expect(result).toBeUndefined()
        expect(mockRepository.getById).toHaveBeenCalledWith(1)
        expect(mockRepository.softDelete).toBeCalledWith(1, 1)
        expect(mockRepository.softDelete).toBeCalledTimes(1)

        expect(mockRepository.create).not.toHaveBeenCalled()
        expect(mockRepository.update).not.toHaveBeenCalled()
      })
    })

    describe("Error cases", () => {
      test("Should throw 404 when category not found", async () => {
        mockRepository.getById.mockResolvedValue(null)

        await expect(categoryService.delete(999, 1)).rejects.toThrow(HttpError)
        await expect(categoryService.delete(999, 1)).rejects.toThrow(
          "Not found",
        )

        expect(mockRepository.softDelete).not.toHaveBeenCalled()
      })
    })
  })
})
