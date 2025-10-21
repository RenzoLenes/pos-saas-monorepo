import type { IInventoryRepository, InventoryWithRelations, GetInventoryByOutletParams } from '@/domain/repositories'

/**
 * Get Inventory By Outlet With Relations Use Case
 * Retrieves inventory for an outlet with product and outlet relations
 */
export class GetInventoryByOutletWithRelationsUseCase {
  constructor(private readonly inventoryRepository: IInventoryRepository) {}

  async execute(params: GetInventoryByOutletParams): Promise<InventoryWithRelations[]> {
    return await this.inventoryRepository.findByOutletWithRelations(params)
  }
}
