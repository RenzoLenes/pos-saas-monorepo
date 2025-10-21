import type { IProductRepository, IInventoryRepository } from '@/domain/repositories'
import type { Product } from '@prisma/client'
import { BusinessError, ErrorCodes } from '@/domain/errors'
import { Money } from '@/domain/value-objects'

export interface CreateProductInput {
  name: string
  description?: string
  price: number
  barcode?: string
  categoryId?: string
  tenantId: string
  isCustom?: boolean
  // Initial inventory for outlets
  initialStock?: Array<{
    outletId: string
    quantity: number
    minStock: number
  }>
}

/**
 * Create Product Use Case
 * Creates a new product and optionally sets up initial inventory
 */
export class CreateProductUseCase {
  constructor(
    private readonly productRepository: IProductRepository,
    private readonly inventoryRepository: IInventoryRepository
  ) {}

  async execute(input: CreateProductInput): Promise<Product> {
    // Validate price
    const price = Money.from(input.price)
    if (price.isNegative()) {
      throw new BusinessError(
        ErrorCodes.BUSINESS_INVALID_OPERATION,
        'El precio no puede ser negativo'
      )
    }

    // Validate barcode uniqueness if provided
    if (input.barcode) {
      const existingProduct = await this.productRepository.findByBarcode(
        input.barcode,
        input.tenantId
      )

      if (existingProduct) {
        throw new BusinessError(
          ErrorCodes.BUSINESS_DUPLICATE_ENTRY,
          'Ya existe un producto con ese código de barras',
          { barcode: input.barcode }
        )
      }
    }

    // Create product
    const product = await this.productRepository.create({
      name: input.name,
      description: input.description,
      price: input.price,
      barcode: input.barcode,
      categoryId: input.categoryId,
      tenantId: input.tenantId,
      isCustom: input.isCustom ?? false,
    })

    // Create initial inventory if provided
    if (input.initialStock && input.initialStock.length > 0) {
      for (const stock of input.initialStock) {
        await this.inventoryRepository.create({
          productId: product.id,
          outletId: stock.outletId,
          quantity: stock.quantity,
          minStock: stock.minStock,
          syncStatus: 'synced',
        })
      }
    }

    return product
  }
}
