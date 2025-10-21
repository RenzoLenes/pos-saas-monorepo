import type { IInventoryRepository } from '@/domain/repositories'
import type { Inventory } from '@prisma/client'

/**
 * Get Low Stock Items Use Case
 * Retrieves inventory items that are at or below minimum stock level
 */
export class GetLowStockItemsUseCase {
  constructor(
    private readonly inventoryRepository: IInventoryRepository
  ) {}

  async execute(outletId: string): Promise<Inventory[]> {
    // Note: This requires a custom query since Prisma doesn't support
    // comparing fields in where clause directly
    const allInventory = await this.inventoryRepository.findMany({
      where: { outletId },
      include: {
        product: true,
      },
    })

    // Filter items where quantity <= minStock
    return allInventory.filter(item => item.quantity <= item.minStock)
  }

  async getCount(outletId: string): Promise<number> {
    return await this.inventoryRepository.getLowStockCount(outletId)
  }
}
