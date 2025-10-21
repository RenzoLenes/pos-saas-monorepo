import type { ICustomerRepository } from '@/domain/repositories'
import { NotFoundError } from '@/domain/errors'

export interface CustomerStats {
  customerId: string
  totalPurchases: number
  totalSpent: number
  lastPurchaseDate: Date | null
  averageTicket: number
}

/**
 * Get Customer Stats Use Case
 * Retrieves customer purchase statistics
 */
export class GetCustomerStatsUseCase {
  constructor(
    private readonly customerRepository: ICustomerRepository
  ) {}

  async execute(customerId: string): Promise<CustomerStats> {
    // Verify customer exists
    const customer = await this.customerRepository.findById(customerId)
    if (!customer) {
      throw new NotFoundError('Cliente', { customerId })
    }

    // Get customer stats
    const stats = await this.customerRepository.getStats(customerId)

    return {
      customerId,
      ...stats,
    }
  }
}
