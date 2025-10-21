import type { ITenantRepository, TenantWithStats } from '@/domain/repositories'
import { NotFoundError } from '@/domain/errors'

/**
 * Get Current Tenant Use Case
 * Fetches tenant by ID with statistics
 */
export class GetCurrentTenantUseCase {
  constructor(private readonly tenantRepository: ITenantRepository) {}

  async execute(tenantId: string): Promise<TenantWithStats> {
    const tenant = await this.tenantRepository.findByIdWithStats(tenantId)

    if (!tenant) {
      throw new NotFoundError('Tenant')
    }

    return tenant
  }
}
