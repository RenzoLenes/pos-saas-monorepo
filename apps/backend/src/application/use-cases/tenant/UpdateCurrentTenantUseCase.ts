import type { ITenantRepository, UpdateTenantInput, TenantWithStats } from '@/domain/repositories'
import { NotFoundError, BusinessError } from '@/domain/errors'

export interface UpdateCurrentTenantParams {
  tenantId: string
  data: UpdateTenantInput
}

/**
 * Update Current Tenant Use Case
 * Updates tenant with validations:
 * - Tenant exists
 * - Subdomain is unique (if changed)
 * - Domain is unique (if changed)
 */
export class UpdateCurrentTenantUseCase {
  constructor(private readonly tenantRepository: ITenantRepository) {}

  async execute(params: UpdateCurrentTenantParams): Promise<TenantWithStats> {
    // Check if tenant exists
    const tenant = await this.tenantRepository.findByIdWithStats(params.tenantId)

    if (!tenant) {
      throw new NotFoundError('Tenant')
    }

    // Validate subdomain uniqueness if it's being changed
    if (params.data.subdomain && params.data.subdomain !== tenant.subdomain) {
      const existingBySubdomain = await this.tenantRepository.findBySubdomain(params.data.subdomain)

      if (existingBySubdomain && existingBySubdomain.id !== params.tenantId) {
        throw new BusinessError('This subdomain is already in use')
      }
    }

    // Validate domain uniqueness if it's being changed
    if (params.data.domain !== undefined) {
      // If setting a domain
      if (params.data.domain && params.data.domain !== tenant.domain) {
        const existingByDomain = await this.tenantRepository.findByDomain(params.data.domain)

        if (existingByDomain && existingByDomain.id !== params.tenantId) {
          throw new BusinessError('This domain is already in use')
        }
      }
    }

    // Update tenant
    await this.tenantRepository.update(params.tenantId, params.data)

    // Fetch updated tenant with stats
    const updatedTenant = await this.tenantRepository.findByIdWithStats(params.tenantId)

    if (!updatedTenant) {
      throw new NotFoundError('Tenant')
    }

    return updatedTenant
  }
}
