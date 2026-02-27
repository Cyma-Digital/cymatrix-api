import { HttpError } from "@/errors/httpError"
import brandRepository from "@/repositories/brand/brand.repository"
import categoryRepository from "@/repositories/category/category.repository"
import productRepository from "@/repositories/product/product.repository"
import {
  CreateProductServiceSchemaInput,
  UpdateProductPartialServiceInput,
} from "@/schemas/product/product.schemas"

export class ProductService {
  constructor(
    private repository = productRepository,
    private brandRepo = brandRepository,
    private categoryRepo = categoryRepository,
  ) {}

  async create(data: CreateProductServiceSchemaInput) {
    const brand = await this.brandRepo.getById(data.brandId)

    if (!brand) {
      throw new HttpError(404, "Brand not found")
    }

    const category = await this.categoryRepo.getById(data.categoryId)

    if (!category) {
      throw new HttpError(404, "Category not found")
    }

    return await this.repository.create(data)
  }

  async listAll() {
    return await this.repository.listAll()
  }

  async getById(productId: number) {
    const product = await this.repository.getById(productId)

    if (!product) {
      throw new HttpError(404, "Not found")
    }
    return product
  }

  async updatePartial(
    productId: number,
    data: UpdateProductPartialServiceInput,
  ) {
    const product = await this.repository.getById(productId)

    if (!product) {
      throw new HttpError(404, "Not found")
    }

    if (data.brandId !== undefined) {
      const brand = await this.brandRepo.getById(data.brandId!)

      if (!brand) {
        throw new HttpError(404, "Brand not found")
      }
    }

    if (data.categoryId !== undefined) {
      const category = await this.categoryRepo.getById(data.categoryId!)

      if (!category) {
        throw new HttpError(404, "Category not found")
      }
    }

    const updatedProduct = await this.repository.update(productId, data)

    if (!updatedProduct) {
      throw new Error("Error on update")
    }

    return updatedProduct
  }

  async delete(productId: number, userId: number) {
    const product = await this.repository.getById(productId)

    if (!product) {
      throw new HttpError(404, "Not found")
    }

    try {
      await this.repository.softDelete(productId, userId)
    } catch {
      throw new HttpError(500, "Failed to delete product")
    }
  }
}

export default new ProductService()
