import type { ICustomerRepository } from '@/domain/repositories'
import type { Customer } from '@prisma/client'
import { NotFoundError } from '@/domain/errors'

/**
 * Get Customer by ID Use Case
 * Retrieves a customer by their ID
 */
export class GetCustomerByTenantUseCase {
  constructor(
    private readonly customerRepository: ICustomerRepository
  ) {}

  async execute(tenantId: string): Promise<Customer[]> {
    const customers = await this.customerRepository.getAll(tenantId)

    if (!customers) {
      throw new NotFoundError('Clientes', { tenantId })
    }           

    return customers
  }
}
