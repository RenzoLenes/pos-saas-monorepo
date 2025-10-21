import type { IProductRepository } from '@/domain/repositories'
import type { Product } from '@prisma/client'
import { NotFoundError, BusinessError, ErrorCodes } from '@/domain/errors'
import { Money } from '@/domain/value-objects'

export interface UpdateProductInput {
  productId: string
  name?: string
  description?: string
  price?: number
  barcode?: string
  categoryId?: string
}

/**
 * Update Product Use Case
 * Updates product information with validation
 */
export class UpdateProductUseCase {
  constructor(
    private readonly productRepository: IProductRepository
  ) {}

  async execute(input: UpdateProductInput): Promise<Product> {
    const { productId, ...updateData } = input

    // Verify product exists
    const product = await this.productRepository.findById(productId)
    if (!product) {
      throw new NotFoundError('Producto', { productId })
    }

    // Validate price if provided
    if (updateData.price !== undefined) {
      const price = Money.from(updateData.price)
      if (price.isNegative()) {
        throw new BusinessError(
          ErrorCodes.BUSINESS_INVALID_OPERATION,
          'El precio no puede ser negativo'
        )
      }
    }

    // Validate barcode uniqueness if changed
    if (updateData.barcode && updateData.barcode !== product.barcode) {
      const existingProduct = await this.productRepository.findByBarcode(
        updateData.barcode,
        product.tenantId,
        productId
      )

      if (existingProduct) {
        throw new BusinessError(
          ErrorCodes.BUSINESS_DUPLICATE_ENTRY,
          'Ya existe un producto con ese código de barras',
          { barcode: updateData.barcode }
        )
      }
    }

    // Update product
    return await this.productRepository.update(productId, updateData)
  }
}
