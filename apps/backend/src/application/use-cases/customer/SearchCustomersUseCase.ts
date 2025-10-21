import type { ICustomerRepository } from '@/domain/repositories'
import type { Customer, Prisma } from '@prisma/client'

export interface SearchCustomersInput {
  tenantId: string
  query?: string
  limit?: number
  offset?: number
}

/**
 * Search Customers Use Case
 * Searches customers with filters and pagination
 */
export class SearchCustomersUseCase {
  constructor(
    private readonly customerRepository: ICustomerRepository
  ) {}

  async execute(input: SearchCustomersInput): Promise<Customer[]> {
    const where: Prisma.CustomerWhereInput = {
      tenantId: input.tenantId,
    }

    if (input.query) {
      where.OR = [
        { firstName: { contains: input.query, mode: 'insensitive' } },
        { lastName: { contains: input.query, mode: 'insensitive' } },
        { email: { contains: input.query, mode: 'insensitive' } },
        { phone: { contains: input.query, mode: 'insensitive' } },
      ]
    }

    return await this.customerRepository.findMany({
      where,
      skip: input.offset,
      take: input.limit || 50,
      orderBy: { firstName: 'asc' },
    })
  }
}
