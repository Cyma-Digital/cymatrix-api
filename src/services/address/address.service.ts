import { HttpError } from "@/errors/httpError"
import addressRepository, {
  AddressUpdatedData,
  CreateAddressData,
} from "@/repositories/address/address.repository"
import {
  CreateAddressServiceSchemaInput,
  UpdateAddressServiceInput,
} from "@/schemas/address/address.schemas"

export class AddressService {
  constructor(private repository = addressRepository) {}

  async create(data: CreateAddressServiceSchemaInput) {
    return await this.repository.create(data)
  }

  async listAll() {
    return await this.repository.listAll()
  }

  async getById(addressId: number) {
    const address = await this.repository.getById(addressId)

    if (!address) {
      throw new HttpError(404, "Not found")
    }
    return address
  }

  async updatePartial(addressId: number, data: UpdateAddressServiceInput) {
    const address = await this.repository.getById(addressId)

    if (!address) {
      throw new HttpError(404, "Not found")
    }
    const updatedAddress = await this.repository.update(addressId, data)

    if (!updatedAddress) {
      throw new Error("Error on update")
    }

    return updatedAddress
  }

  async delete(addressId: number, userId: number) {
    const address = await this.repository.getById(addressId)

    if (!address) {
      throw new HttpError(404, "Not found")
    }

    try {
      await this.repository.softDelete(addressId, userId)
    } catch {
      throw new HttpError(500, "Failed to delete address")
    }
  }
}

export default new AddressService()
