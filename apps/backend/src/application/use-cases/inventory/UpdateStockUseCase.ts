import type { IInventoryRepository, IProductRepository } from '@/domain/repositories'
import type { Inventory } from '@prisma/client'
import { NotFoundError, BusinessError, ErrorCodes } from '@/domain/errors'

export interface UpdateStockInput {
  productId: string
  outletId: string
  quantityChange: number // Positive for addition, negative for subtraction
  minStock?: number
  maxStock?: number
  reason?: 'purchase' | 'sale' | 'adjustment' | 'transfer' | 'return'
}

/**
 * Update Stock Use Case
 * Updates inventory quantity for a product at a specific outlet
 */
export class UpdateStockUseCase {
  constructor(
    private readonly inventoryRepository: IInventoryRepository,
    private readonly productRepository: IProductRepository
  ) {}

  async execute(input: UpdateStockInput): Promise<Inventory> {
    const { productId, outletId, quantityChange } = input

    // Verify product exists
    const product = await this.productRepository.findById(productId)
    if (!product) {
      throw new NotFoundError('Producto', { productId })
    }

    // Custom products don't have inventory
    if (product.isCustom) {
      throw new BusinessError(
        ErrorCodes.BUSINESS_INVALID_OPERATION,
        'Los productos personalizados no tienen inventario'
      )
    }

    // Get or create inventory record
    let inventory = await this.inventoryRepository.findByProductAndOutlet(
      productId,
      outletId
    )

    if (!inventory) {
      // Create inventory if it doesn't exist
      inventory = await this.inventoryRepository.create({
        productId,
        outletId,
        quantity: 0,
        minStock: 0,
        syncStatus: 'synced',
      })
    }

    // Calculate new quantity (validation is handled by Inventory entity)
    const newQuantity = inventory.quantity + quantityChange

    // Validate using business logic (this is now in Inventory.updateStock)
    if (newQuantity < 0) {
      throw new BusinessError(
        ErrorCodes.BUSINESS_INSUFFICIENT_STOCK,
        'Stock insuficiente para realizar la operación',
        {
          currentStock: inventory.quantity,
          requestedChange: quantityChange,
          productName: product.name,
        }
      )
    }

    // Calculate final minStock and maxStock values
    const finalMinStock = input.minStock !== undefined ? input.minStock : inventory.minStock
    const finalMaxStock = input.maxStock !== undefined ? input.maxStock : inventory.maxStock

    // Validate that maxStock is greater than or equal to minStock
    if (finalMaxStock !== null && finalMaxStock < finalMinStock) {
      throw new BusinessError(
        ErrorCodes.VALIDATION_ERROR,
        'El stock máximo no puede ser menor que el stock mínimo',
        {
          maxStock: finalMaxStock,
          minStock: finalMinStock,
          productName: product.name,
        }
      )
    }

    // Update inventory
    const updatedInventory = await this.inventoryRepository.update(inventory.id, {
      quantity: newQuantity,
      lastUpdated: new Date(),
      minStock: finalMinStock,
      maxStock: finalMaxStock,
      syncStatus: 'synced',
    })

    return updatedInventory
  }

  /**
   * Bulk update stock for multiple products
   */
  async executeBulk(updates: UpdateStockInput[]): Promise<Inventory[]> {
    const results: Inventory[] = []

    for (const update of updates) {
      const result = await this.execute(update)
      results.push(result)
    }

    return results
  }
}
