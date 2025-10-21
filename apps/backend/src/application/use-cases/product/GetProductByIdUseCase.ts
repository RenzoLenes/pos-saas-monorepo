import type { IProductRepository } from '@/domain/repositories'
import type { Product } from '@prisma/client'
import { NotFoundError } from '@/domain/errors'

/**
 * Get Product by ID Use Case
 * Retrieves a product by its ID
 */
export class GetProductByIdUseCase {
  constructor(
    private readonly productRepository: IProductRepository
  ) {}

  async execute(productId: string): Promise<Product> {
    const product = await this.productRepository.findById(productId)

    if (!product) {
      throw new NotFoundError('Producto', { productId })
    }

    return product
  }
}
