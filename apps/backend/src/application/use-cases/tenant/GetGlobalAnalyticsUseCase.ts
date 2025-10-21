import type { ITenantRepository, GlobalAnalytics } from '@/domain/repositories'

/**
 * Get Global Analytics Use Case
 * Retrieves global analytics across all tenants
 */
export class GetGlobalAnalyticsUseCase {
  constructor(private readonly tenantRepository: ITenantRepository) {}

  async execute(): Promise<GlobalAnalytics> {
    return await this.tenantRepository.getGlobalAnalytics()
  }
}
