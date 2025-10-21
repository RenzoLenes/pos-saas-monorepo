import type { PrismaClient, Sale, Prisma, PaymentMethod } from '@prisma/client'
import type { ISaleRepository, SaleWithItems, GetSalesParams } from '@/domain/repositories'

type DbClient = Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>

export class PrismaSaleRepository implements ISaleRepository {
  constructor(private readonly db: DbClient) {}

  async getLastSale(outletId: string): Promise<{ saleNumber: string | null; createdAt: Date } | null> {
    const lastSale = await this.db.sale.findFirst({
      where: { outletId },
      orderBy: { createdAt: 'desc' },
      select: {
        saleNumber: true,
        createdAt: true,
      },
    })

    return lastSale
  }

  async createSale(data: {
    saleNumber: string
    customerId: string | null
    outletId: string
    userId: string
    subtotal: number
    discount: number
    total: number
    paymentMethod: PaymentMethod
    cashReceived: number | null
    change: number | null
    items: Array<{
      productId: string
      quantity: number
      unitPrice: number
      totalPrice: number
    }>
  }): Promise<Sale> {
    const sale = await this.db.sale.create({
      data: {
        saleNumber: data.saleNumber,
        customerId: data.customerId,
        outletId: data.outletId,
        userId: data.userId,
        subtotal: data.subtotal,
        discount: data.discount,
        total: data.total,
        paymentMethod: data.paymentMethod,
        cashReceived: data.cashReceived,
        change: data.change,
        syncStatus: 'synced',
        items: {
          create: data.items,
        },
      },
      include: {
        items: true,
      },
    })

    return sale
  }

  async findById(saleId: string): Promise<SaleWithItems | null> {
    return await this.db.sale.findUnique({
      where: { id: saleId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        customer: true,
      },
    }) as SaleWithItems | null
  }

  async findManyWithRelations(params: GetSalesParams): Promise<SaleWithItems[]> {
    const whereClause: Prisma.SaleWhereInput = {}

    if (params.outletId) {
      whereClause.outletId = params.outletId
    }

    if (params.startDate || params.endDate) {
      whereClause.createdAt = {}
      if (params.startDate) whereClause.createdAt.gte = params.startDate
      if (params.endDate) whereClause.createdAt.lte = params.endDate
    }

    return await this.db.sale.findMany({
      where: whereClause,
      include: {
        items: {
          include: {
            product: true,
          },
        },
        customer: true,
      },
      orderBy: { createdAt: 'desc' },
      take: params.limit,
      skip: params.offset,
    }) as SaleWithItems[]
  }

  async findMany(params: {
    where: Prisma.SaleWhereInput
    skip?: number
    take?: number
    orderBy?: Prisma.SaleOrderByWithRelationInput
    include?: Prisma.SaleInclude
  }): Promise<Sale[]> {
    return await this.db.sale.findMany(params)
  }

  async count(where: Prisma.SaleWhereInput): Promise<number> {
    return await this.db.sale.count({ where })
  }

  async getDailySummary(outletId: string | undefined, date: Date): Promise<{
    totalSales: number
    totalRevenue: number
    totalDiscount: number
    salesByPaymentMethod: Record<string, { count: number; total: number }>
  }> {
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)

    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    const whereClause: Prisma.SaleWhereInput = {
      createdAt: {
        gte: startOfDay,
        lte: endOfDay,
      },
    }

    if (outletId) {
      whereClause.outletId = outletId
    }

    const sales = await this.db.sale.findMany({
      where: whereClause,
      select: {
        total: true,
        discount: true,
        paymentMethod: true,
      },
    })

    const totalSales = sales.length
    const totalRevenue = sales.reduce((sum, sale) => sum + Number(sale.total), 0)
    const totalDiscount = sales.reduce((sum, sale) => sum + Number(sale.discount), 0)

    const salesByPaymentMethod: Record<string, { count: number; total: number }> = {}

    for (const sale of sales) {
      if (!salesByPaymentMethod[sale.paymentMethod]) {
        salesByPaymentMethod[sale.paymentMethod] = { count: 0, total: 0 }
      }
      salesByPaymentMethod[sale.paymentMethod].count++
      salesByPaymentMethod[sale.paymentMethod].total += Number(sale.total)
    }

    return {
      totalSales,
      totalRevenue,
      totalDiscount,
      salesByPaymentMethod,
    }
  }
}
