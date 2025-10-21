import type { IInventoryRepository, InventoryWithRelations } from '@/domain/repositories'

/**
 * Get Low Stock With Relations Use Case
 * Retrieves low stock items for an outlet with product and outlet relations
 */
export class GetLowStockWithRelationsUseCase {
  constructor(private readonly inventoryRepository: IInventoryRepository) {}

  async execute(outletId: string): Promise<InventoryWithRelations[]> {
    return await this.inventoryRepository.findLowStockWithRelations(outletId)
  }
}
