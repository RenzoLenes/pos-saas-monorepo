import type { ICustomerRepository } from '@/domain/repositories'
import type { Customer } from '@prisma/client'
import { NotFoundError } from '@/domain/errors'

/**
 * Get Customer by ID Use Case
 * Retrieves a customer by their ID
 */
export class GetCustomerByIdUseCase {
  constructor(
    private readonly customerRepository: ICustomerRepository
  ) {}

  async execute(customerId: string): Promise<Customer> {
    const customer = await this.customerRepository.findById(customerId)

    if (!customer) {
      throw new NotFoundError('Cliente', { customerId })
    }

    return customer
  }
}
