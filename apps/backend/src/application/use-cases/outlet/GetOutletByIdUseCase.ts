import type { IOutletRepository, OutletWithStats } from '@/domain/repositories'
import { NotFoundError } from '@/domain/errors'

/**
 * Get Outlet By ID Use Case
 * Retrieves outlet by ID with stats
 */
export class GetOutletByIdUseCase {
  constructor(private readonly outletRepository: IOutletRepository) {}

  async execute(id: string, tenantId: string): Promise<OutletWithStats> {
    const outlet = await this.outletRepository.findById(id, tenantId)

    if (!outlet) {
      throw new NotFoundError('Outlet')
    }

    return outlet
  }
}
