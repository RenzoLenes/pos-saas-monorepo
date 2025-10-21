import type { ITenantRepository, TenantWithStats } from '@/domain/repositories'

export interface UpdateTenantStatusInput {
  id: string
  status: 'active' | 'suspended' | 'inactive'
}

/**
 * Update Tenant Status Use Case
 * Updates tenant status (suspend/activate)
 */
export class UpdateTenantStatusUseCase {
  constructor(private readonly tenantRepository: ITenantRepository) {}

  async execute(input: UpdateTenantStatusInput): Promise<TenantWithStats> {
    return await this.tenantRepository.updateStatus(input.id, input.status)
  }
}
