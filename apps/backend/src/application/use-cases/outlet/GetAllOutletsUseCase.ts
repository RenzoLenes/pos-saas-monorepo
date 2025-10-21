import type { IOutletRepository, OutletWithStats, GetOutletsParams } from '@/domain/repositories'

/**
 * Get All Outlets Use Case
 * Retrieves all outlets for a tenant with stats
 */
export class GetAllOutletsUseCase {
  constructor(private readonly outletRepository: IOutletRepository) {}

  async execute(params: GetOutletsParams): Promise<OutletWithStats[]> {
    return await this.outletRepository.findAllByTenant(params)
  }
}
