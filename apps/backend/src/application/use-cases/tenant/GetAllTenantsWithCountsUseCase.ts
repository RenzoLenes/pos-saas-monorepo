import type { ITenantRepository, TenantWithCounts } from '@/domain/repositories'

/**
 * Get All Tenants With Counts Use Case
 * Retrieves all tenants with _count for users, outlets, products, customers
 */
export class GetAllTenantsWithCountsUseCase {
  constructor(private readonly tenantRepository: ITenantRepository) {}

  async execute(): Promise<TenantWithCounts[]> {
    return await this.tenantRepository.findAllWithCounts()
  }
}
