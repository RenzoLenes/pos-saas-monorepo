import type { ISaleRepository } from '@/domain/repositories'

export interface DailySummary {
  totalSales: number
  totalRevenue: number
  totalDiscount: number
  salesByPaymentMethod: Record<string, { count: number; total: number }>
}

/**
 * Get Daily Summary Use Case
 * Retrieves daily sales summary for an outlet or all outlets if no outletId provided
 */
export class GetDailySummaryUseCase {
  constructor(
    private readonly saleRepository: ISaleRepository
  ) {}

  async execute(outletId: string | undefined, date: Date): Promise<DailySummary> {
    return await this.saleRepository.getDailySummary(outletId, date)
  }
}
