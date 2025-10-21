import type { Sale, SaleItem, Prisma, PaymentMethod, Product, Customer } from '@prisma/client'

export type SaleItemWithProduct = SaleItem & {
  product: Product
}

export type SaleWithItems = Sale & {
  items: SaleItemWithProduct[]
  customer?: Customer | null
}

export interface GetSalesParams {
  outletId?: string
  startDate?: Date
  endDate?: Date
  limit?: number
  offset?: number
}

export interface ISaleRepository {
  /**
   * Get last sale for an outlet (for sale number generation)
   */
  getLastSale(outletId: string): Promise<{ saleNumber: string | null; createdAt: Date } | null>

  /**
   * Create a new sale with items
   */
  createSale(data: {
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
  }): Promise<Sale>

  /**
   * Get sale by ID with items and relations
   */
  findById(saleId: string): Promise<SaleWithItems | null>

  /**
   * Get sales with filters and relations
   */
  findManyWithRelations(params: GetSalesParams): Promise<SaleWithItems[]>

  /**
   * Get sales with pagination and filters (raw Prisma for flexibility)
   */
  findMany(params: {
    where: Prisma.SaleWhereInput
    skip?: number
    take?: number
    orderBy?: Prisma.SaleOrderByWithRelationInput
    include?: Prisma.SaleInclude
  }): Promise<Sale[]>

  /**
   * Count sales matching filter
   */
  count(where: Prisma.SaleWhereInput): Promise<number>

  /**
   * Get daily sales summary
   */
  getDailySummary(outletId: string | undefined, date: Date): Promise<{
    totalSales: number
    totalRevenue: number
    totalDiscount: number
    salesByPaymentMethod: Record<string, { count: number; total: number }>
  }>
}
