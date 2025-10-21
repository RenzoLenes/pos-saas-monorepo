import type { IProductRepository } from '@/domain/repositories'
import { NotFoundError, BusinessError, ErrorCodes } from '@/domain/errors'

/**
 * Delete Product Use Case
 * Deletes a product after validating it has no sales history
 */
export class DeleteProductUseCase {
  constructor(
    private readonly productRepository: IProductRepository
  ) {}

  async execute(productId: string): Promise<void> {
    // Verify product exists
    const product = await this.productRepository.findById(productId)
    if (!product) {
      throw new NotFoundError('Producto', { productId })
    }

    // Check if product has sales history
    const hasSales = await this.productRepository.hasSalesHistory(productId)
    if (hasSales) {
      throw new BusinessError(
        ErrorCodes.BUSINESS_INVALID_OPERATION,
        'No se puede eliminar un producto con historial de ventas. Márcalo como inactivo en su lugar.'
      )
    }

    // Delete product
    await this.productRepository.delete(productId)
  }
}
