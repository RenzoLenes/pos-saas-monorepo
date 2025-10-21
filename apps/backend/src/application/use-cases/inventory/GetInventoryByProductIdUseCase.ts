import type { IInventoryRepository, InventoryWithRelations } from '@/domain/repositories'

export interface GetInventoryByProductIdInput {
  productId: string
  tenantId: string
}

/**
 * Get Inventory By Product ID Use Case
 * Retrieves all inventory records for a specific product across outlets
 */
export class GetInventoryByProductIdUseCase {
  constructor(private readonly inventoryRepository: IInventoryRepository) {}

  async execute(input: GetInventoryByProductIdInput): Promise<InventoryWithRelations[]> {
    return await this.inventoryRepository.findByProductIdWithRelations(input.productId, input.tenantId)
  }
}
