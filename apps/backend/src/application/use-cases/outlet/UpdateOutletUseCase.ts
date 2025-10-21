import type { IOutletRepository, UpdateOutletInput } from '@/domain/repositories'
import type { Outlet } from '@prisma/client'
import { NotFoundError, BusinessError } from '@/domain/errors'

export interface UpdateOutletParams {
  id: string
  tenantId: string
  data: UpdateOutletInput
}

/**
 * Update Outlet Use Case
 * Updates an outlet with validation
 */
export class UpdateOutletUseCase {
  constructor(private readonly outletRepository: IOutletRepository) {}

  async execute(params: UpdateOutletParams): Promise<Outlet> {
    // Check if outlet exists
    const outlet = await this.outletRepository.findById(params.id, params.tenantId)

    if (!outlet) {
      throw new NotFoundError('Outlet')
    }

    // If updating name, check if new name already exists
    if (params.data.name && params.data.name !== outlet.name) {
      const existing = await this.outletRepository.findByName(
        params.data.name,
        params.tenantId,
        params.id
      )

      if (existing) {
        throw new BusinessError('An outlet with this name already exists')
      }
    }

    return await this.outletRepository.update(params.id, params.data)
  }
}
