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
}

export default new AddressService()
