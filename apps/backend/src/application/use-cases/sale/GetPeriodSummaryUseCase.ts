import type { ISaleRepository } from '@/domain/repositories'
import type { Prisma } from '@prisma/client'

export interface GetPeriodSummaryInput {
  outletId?: string
  startDate: Date
  endDate: Date
}

export interface PeriodSummary {
  totalSales: number
  totalRevenue: number
  salesByPaymentMethod: {
    cash: { count: number; total: number }
    card: { count: number; total: number }
    mixed: { count: number; total: number }
  }
  period: {
    start: Date
    end: Date
  }
}

/**
 * Get Period Summary Use Case
 * Retrieves sales summary for a date range
 */
export class GetPeriodSummaryUseCase {
  constructor(
    private readonly saleRepository: ISaleRepository
  ) {}

  async execute(input: GetPeriodSummaryInput): Promise<PeriodSummary> {
    const where: Prisma.SaleWhereInput = {
      createdAt: {
        gte: input.startDate,
        lte: input.endDate,
      },
    }

    if (input.outletId) {
      where.outletId = input.outletId
    }

    // Get sales data grouped by payment method
    const sales = await this.saleRepository.findMany({
      where,
      include: {
        items: false,
      },
    })

    // Calculate summary
    const totalSales = sales.length
    const totalRevenue = sales.reduce((sum, sale) => sum + Number(sale.total), 0)

    const salesByPaymentMethod = {
      cash: { count: 0, total: 0 },
      card: { count: 0, total: 0 },
      mixed: { count: 0, total: 0 },
    }

    for (const sale of sales) {
      salesByPaymentMethod[sale.paymentMethod].count++
      salesByPaymentMethod[sale.paymentMethod].total += Number(sale.total)
    }

    return {
      totalSales,
      totalRevenue,
      salesByPaymentMethod,
      period: {
        start: input.startDate,
        end: input.endDate,
      },
    }
  }
}
