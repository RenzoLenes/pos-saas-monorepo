import type { IProductRepository } from '@/domain/repositories'
import type { Product } from '@prisma/client'
import { NotFoundError } from '@/domain/errors'

/**
 * Get Product by Barcode Use Case
 * Retrieves a product by its barcode
 */
export class GetProductByBarcodeUseCase {
  constructor(
    private readonly productRepository: IProductRepository
  ) {}

  async execute(barcode: string, tenantId: string): Promise<Product> {
    const product = await this.productRepository.findByBarcode(barcode, tenantId)

    if (!product) {
      throw new NotFoundError('Producto', { barcode })
    }

    return product
  }
}
