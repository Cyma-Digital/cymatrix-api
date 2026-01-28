import brandRepository, {
  CreateBrandData,
} from "@/repositories/brand/brand.repository"

export class BrandService {
  constructor(private respository = brandRepository) {}

  async create(data: CreateBrandData) {
    return this.respository.create(data)
  }
}

export default new BrandService()
