import type { IInventoryRepository, InventoryWithRelations } from '@/domain/repositories'
import { NotFoundError } from '@/domain/errors'

/**
 * Get Inventory By ID With Relations Use Case
 * Retrieves inventory by ID with product and outlet relations
 */
export class GetInventoryByIdWithRelationsUseCase {
  constructor(private readonly inventoryRepository: IInventoryRepository) {}

  async execute(inventoryId: string): Promise<InventoryWithRelations> {
    const inventory = await this.inventoryRepository.findByIdWithRelations(inventoryId)

    if (!inventory) {
      throw new NotFoundError('Inventory')
    }

    return inventory
  }
}
