import { HttpError } from "@/errors/httpError"
import addressRepository, {
  AddressUpdatedData,
  CreateAddressData,
} from "@/repositories/address/address.repository"

export class AddressService {
  constructor(private repository = addressRepository) {}

  async create(data: CreateAddressData) {
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
}

export default new AddressService()
