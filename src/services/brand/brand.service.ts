import { HttpError } from "@/errors/httpError"
import brandRepository, {
  BradUpdatedData,
  CreateBrandData,
} from "@/repositories/brand/brand.repository"

export class BrandService {
  constructor(private respository = brandRepository) {}

  async create(data: CreateBrandData) {
    return await this.respository.create(data)
  }

  async listAll() {
    return await this.respository.listAll()
  }

  async getById(brandId: number) {
    const brand = await this.respository.getById(brandId)

    if (!brand) {
      throw new HttpError(404, "Not found")
    }
    return brand
  }

  async updatePartial(brandId: number, data: BradUpdatedData) {
    const brand = await this.respository.getById(brandId)

    if (!brand) {
      throw new HttpError(404, "Not found")
    }
    const updatedBrand = await this.respository.update(brandId, data)

    if (!updatedBrand) {
      throw new Error("Erro on update")
    }

    return updatedBrand
  }

  async delete(brandId: number, userId: number) {
    const brand = await this.respository.getById(brandId)

    if (!brand) {
      throw new HttpError(404, "Not found")
    }

    try {
      await this.respository.softDelete(brandId, userId)
    } catch {
      throw new HttpError(500, "Failed to delete brand")
    }
  }
}

export default new BrandService()
