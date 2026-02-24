import { AddressService } from "@/services/address/address.service"
import { HttpError } from "@/errors/httpError"
import type {
  CreateAddressData,
  AddressUpdatedData,
} from "@/repositories/address/address.repository"
import {
  CreateAddressServiceSchemaInput,
  UpdateAddressPartialServiceInput,
} from "@/schemas/address/address.schemas"

const mockRepository = {
  create: vi.fn(),
  listAll: vi.fn(),
  getById: vi.fn(),
  update: vi.fn(),
  softDelete: vi.fn(),
}

describe("@services/AddressService", () => {
  let addressService: AddressService

  beforeEach(() => {
    vi.clearAllMocks()
    addressService = new AddressService(mockRepository)
  })

  describe("create()", () => {
    describe("Success cases", () => {
      test("Should create and return address", async () => {
        const input: CreateAddressServiceSchemaInput = {
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
          createdBy: 1,
          updatedBy: 1,
        }

        const expectedAddress = {
          id: 1,
          ...input,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
          deletedBy: null,
        }

        mockRepository.create.mockResolvedValue(expectedAddress)

        const result = await addressService.create(input)

        expect(result).toBeDefined()
        expect(result.id).toBeDefined()
        expect(result).toMatchObject(input)
        expect(result).toEqual(expectedAddress)
        expect(result.id).toBeTypeOf("number")
        expect(result.userId).toBeTypeOf("number")
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
      test("Should return all addresses", async () => {
        const addresses = [
          {
            userId: "1",
            label: "comércio",
            street: "Rua João Silva Souza Soares Santos",
            number: 1,
            complement: "terceiro andar",
            neighborhood: "Jardim de jardins",
            city: "Jacareí",
            state: "SP",
            zipCode: "123.456-78",
            isDefault: true,
            createdBy: 1,
            updatedBy: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
            deletedBy: null,
          },
          {
            userId: "1",
            label: "loja",
            street: "Rua Zé Silva Souza Soares Santos",
            number: 2,
            neighborhood: "Jardim de cactos",
            city: "Jacareí",
            state: "SP",
            zipCode: "987.654-32",
            isDefault: true,
            createdBy: 1,
            updatedBy: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
            deletedBy: null,
          },
          {
            userId: "1",
            label: "indústria",
            street: "Rua Zeca Silva Souza Soares Santos",
            number: 234,
            complement: "segundo prédio",
            neighborhood: "Jardim das fábricas",
            city: "Jacareí",
            state: "SP",
            zipCode: "321.456-87",
            isDefault: true,
            createdBy: 1,
            updatedBy: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
            deletedBy: null,
          },
        ]

        mockRepository.listAll.mockResolvedValue(addresses)

        const result = await addressService.listAll()

        expect(result).toBeDefined()
        expect(result).toHaveLength(3)
        expect(result).toMatchObject(addresses)
        expect(Array.isArray(result)).toBe(true)

        expect(mockRepository.listAll).toHaveBeenCalled()
        expect(mockRepository.listAll).toHaveBeenCalledWith()
        expect(mockRepository.listAll).toHaveBeenCalledTimes(1)

        expect(mockRepository.update).not.toHaveBeenCalled()
        expect(mockRepository.create).not.toHaveBeenCalled()
        expect(mockRepository.softDelete).not.toHaveBeenCalled()
      })

      test("Should return empty array when no addresses", async () => {
        mockRepository.listAll.mockResolvedValue([])

        const result = await addressService.listAll()

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
      test("Should return address when exists", async () => {
        const address = {
          id: 1,
          userId: "1",
          label: "comércio",
          street: "Rua João Silva Souza Soares Santos",
          number: 1,
          complement: "terceiro andar",
          neighborhood: "Jardim de jardins",
          city: "Jacareí",
          state: "SP",
          zipCode: "123.456-78",
          isDefault: true,
          createdBy: 1,
          updatedBy: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
          deletedBy: null,
        }

        mockRepository.getById.mockResolvedValue(address)

        const result = await addressService.getById(address.id)

        expect(result).toBeDefined()
        expect(result).toEqual(address)
        expect(result).toMatchObject(address)
        expect(Array.isArray(result)).toBe(false)

        expect(mockRepository.getById).toHaveBeenCalled()
        expect(mockRepository.getById).toHaveBeenCalledWith(address.id)
        expect(mockRepository.getById).toHaveBeenCalledTimes(1)

        expect(mockRepository.update).not.toHaveBeenCalled()
        expect(mockRepository.create).not.toHaveBeenCalled()
        expect(mockRepository.softDelete).not.toHaveBeenCalled()
      })
    })
  })

  describe("updatePartial()", () => {
    describe("Success case", () => {
      test("Should update and return address", async () => {
        const existingAddress = {
          id: 1,
          userId: "1",
          label: "comércio",
          street: "Rua João Silva Souza Soares Santos",
          number: 1,
          complement: "terceiro andar",
          neighborhood: "Jardim de jardins",
          city: "Jacareí",
          state: "SP",
          zipCode: "123.456-78",
          isDefault: true,
          createdBy: 1,
          updatedBy: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
          deletedBy: null,
        }

        const updateData: UpdateAddressPartialServiceInput = {
          street: "Rua Paulo de Paula",
          number: 28,
          updatedBy: 1,
        }

        const updatedAddress = {
          ...existingAddress,
          ...updateData,
        }

        mockRepository.getById.mockResolvedValue(existingAddress)
        mockRepository.update.mockResolvedValue(updatedAddress)

        const result = await addressService.updatePartial(1, updateData)

        expect(result).toEqual(updatedAddress)
        expect(mockRepository.getById).toHaveBeenCalledWith(1)
        expect(mockRepository.update).toHaveBeenCalledWith(1, updateData)

        expect(mockRepository.create).not.toHaveBeenCalled()
        expect(mockRepository.softDelete).not.toHaveBeenCalled()
      })
    })
  })

  describe("delete()", () => {
    describe("Success cases", () => {
      test("Should soft delete address", async () => {
        const address = {
          id: 1,
          userId: "1",
          label: "comércio",
          street: "Rua João Silva Souza Soares Santos",
          number: 1,
          complement: "terceiro andar",
          neighborhood: "Jardim de jardins",
          city: "Jacareí",
          state: "SP",
          zipCode: "123.456-78",
          isDefault: true,
          createdBy: 1,
          updatedBy: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
          deletedBy: null,
        }

        mockRepository.getById.mockResolvedValue(address)
        mockRepository.softDelete.mockResolvedValue(undefined)

        const result = await addressService.delete(1, 1)

        expect(result).toBeUndefined()
        expect(mockRepository.getById).toHaveBeenCalledWith(1)
        expect(mockRepository.softDelete).toBeCalledWith(1, 1)
        expect(mockRepository.softDelete).toBeCalledTimes(1)

        expect(mockRepository.create).not.toHaveBeenCalled()
        expect(mockRepository.update).not.toHaveBeenCalled()
      })
    })

    describe("Error cases", () => {
      test("Should throw 404 when address not found", async () => {
        mockRepository.getById.mockResolvedValue(null)

        await expect(addressService.delete(999, 1)).rejects.toThrow(HttpError)
        await expect(addressService.delete(999, 1)).rejects.toThrow("Not found")

        expect(mockRepository.softDelete).not.toHaveBeenCalled()
      })
    })
  })
})
