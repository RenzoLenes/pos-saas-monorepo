import type { ISaleRepository, SaleWithItems } from '@/domain/repositories'

export interface GetSalesInput {
  outletId?: string
  startDate?: Date
  endDate?: Date
  limit?: number
  offset?: number
}

/**
 * Get Sales Use Case
 * Retrieves sales with filters, pagination, and relations (items, products, customer)
 */
export class GetSalesUseCase {
  constructor(
    private readonly saleRepository: ISaleRepository
  ) {}

  async execute(input: GetSalesInput): Promise<SaleWithItems[]> {
    return await this.saleRepository.findManyWithRelations({
      outletId: input.outletId,
      startDate: input.startDate,
      endDate: input.endDate,
      limit: input.limit,
      offset: input.offset,
    })
  }
}
