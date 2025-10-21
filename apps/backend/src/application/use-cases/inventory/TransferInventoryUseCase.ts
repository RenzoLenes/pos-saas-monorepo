import type { IInventoryRepository, IProductRepository } from '@/domain/repositories'
import { NotFoundError, BusinessError, ErrorCodes } from '@/domain/errors'

export interface TransferInventoryInput {
  productId: string
  fromOutletId: string
  toOutletId: string
  quantity: number
}

/**
 * Transfer Inventory Use Case
 * Transfers inventory quantity from one outlet to another
 */
export class TransferInventoryUseCase {
  constructor(
    private readonly inventoryRepository: IInventoryRepository,
    private readonly productRepository: IProductRepository
  ) {}

  async execute(input: TransferInventoryInput): Promise<void> {
    const { productId, fromOutletId, toOutletId, quantity } = input

    // Validate quantity
    if (quantity <= 0) {
      throw new BusinessError(
        ErrorCodes.BUSINESS_INVALID_OPERATION,
        'La cantidad a transferir debe ser mayor a 0'
      )
    }

    // Verify product exists
    const product = await this.productRepository.findById(productId)
    if (!product) {
      throw new NotFoundError('Producto', { productId })
    }

    // Get source inventory
    const sourceInventory = await this.inventoryRepository.findByProductAndOutlet(
      productId,
      fromOutletId
    )

    if (!sourceInventory) {
      throw new NotFoundError('Inventario origen', { productId, outletId: fromOutletId })
    }

    // Validate sufficient stock
    if (sourceInventory.quantity < quantity) {
      throw new BusinessError(
        ErrorCodes.BUSINESS_INSUFFICIENT_STOCK,
        'Stock insuficiente en el outlet de origen',
        {
          available: sourceInventory.quantity,
          requested: quantity,
          productName: product.name,
        }
      )
    }

    // Get or create destination inventory
    let destInventory = await this.inventoryRepository.findByProductAndOutlet(
      productId,
      toOutletId
    )

    if (!destInventory) {
      destInventory = await this.inventoryRepository.create({
        productId,
        outletId: toOutletId,
        quantity: 0,
        minStock: 0,
        syncStatus: 'synced',
      })
    }

    // Perform transfer
    await this.inventoryRepository.update(sourceInventory.id, {
      quantity: sourceInventory.quantity - quantity,
      lastUpdated: new Date(),
      syncStatus: 'synced',
    })

    await this.inventoryRepository.update(destInventory.id, {
      quantity: destInventory.quantity + quantity,
      lastUpdated: new Date(),
      syncStatus: 'synced',
    })
  }
}
