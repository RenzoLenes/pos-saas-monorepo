import { IInventoryRepository } from '@/domain/repositories/IInventoryRepository'
import { BusinessError, ErrorCodes } from '@/domain/errors'

interface GetInventoryByIdInput {
  inventoryId: string
}

/**
 * Get Inventory By ID Use Case
 * Retrieves inventory details by ID
 */
export class GetInventoryByIdUseCase {
  constructor(private inventoryRepository: IInventoryRepository) {}

  async execute(input: GetInventoryByIdInput) {
    const inventory = await this.inventoryRepository.findById(input.inventoryId)

    if (!inventory) {
      throw new BusinessError('Inventario no encontrado', ErrorCodes.RESOURCE_NOT_FOUND)
    }

    return inventory
  }
}
