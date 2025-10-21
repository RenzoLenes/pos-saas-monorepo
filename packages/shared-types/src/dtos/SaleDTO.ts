/**
 * Sale Data Transfer Objects
 * DTOs for Sale module - used for communication between layers
 */

export interface SaleItemDTO {
  id: string
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

export interface SaleDTO {
  id: string
  saleNumber: string
  outletId: string
  userId: string
  customerId?: string | null
  customerName?: string | null
  subtotal: number
  discount: number
  total: number
  paymentMethod: string
  cashReceived?: number | null
  cardAmount?: number | null
  change?: number | null
  status?: string
  createdAt: Date
  items: SaleItemDTO[]
}

export interface SaleSummaryDTO {
  id: string
  saleNumber: string
  total: number
  paymentMethod: string
  customerName?: string | null
  createdAt: Date
  itemCount: number
}

export interface DailySummaryDTO {
  date: Date
  totalSales: number
  totalRevenue: number
  averageTicket: number
  salesByPaymentMethod: {
    cash: number
    card: number
    mixed: number
  }
}

export interface PeriodSummaryDTO {
  startDate: Date
  endDate: Date
  totalSales: number
  totalRevenue: number
  averageTicket: number
  salesByDay: Array<{
    date: Date
    sales: number
    revenue: number
  }>
  salesByPaymentMethod: {
    cash: { count: number; total: number }
    card: { count: number; total: number }
    mixed: { count: number; total: number }
  }
  topProducts: Array<{
    productId: string
    productName: string
    quantity: number
    revenue: number
  }>
}
