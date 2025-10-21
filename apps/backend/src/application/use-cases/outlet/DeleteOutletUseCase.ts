import type { IOutletRepository } from '@/domain/repositories'
import { NotFoundError, BusinessError } from '@/domain/errors'

export interface DeleteOutletParams {
  id: string
  tenantId: string
}

/**
 * Delete Outlet Use Case
 * Deletes an outlet with validation (no users, no inventory)
 */
export class DeleteOutletUseCase {
  constructor(private readonly outletRepository: IOutletRepository) {}

  async execute(params: DeleteOutletParams): Promise<void> {
    // Check if outlet exists
    const outlet = await this.outletRepository.findById(params.id, params.tenantId)

    if (!outlet) {
      throw new NotFoundError('Outlet')
    }

    // Check if outlet has active users
    const usersCount = await this.outletRepository.countUsersByOutlet(params.id)

    if (usersCount > 0) {
      throw new BusinessError(`Cannot delete outlet with ${usersCount} associated users`)
    }

    // Check if outlet has inventory
    const inventoryCount = await this.outletRepository.countInventoryByOutlet(params.id)

    if (inventoryCount > 0) {
      throw new BusinessError(`Cannot delete outlet with ${inventoryCount} inventory items`)
    }

    await this.outletRepository.delete(params.id)
  }
}
