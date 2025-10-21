/**
 * Customer Data Transfer Objects
 * DTOs for Customer module - used for communication between layers
 */

export interface CustomerDTO {
  id: string
  firstName: string
  lastName: string
  fullName: string
  email?: string | null
  phone?: string | null
  address?: string | null
  isActive: boolean
  tenantId: string
  createdAt: Date
  updatedAt: Date
}

export interface CustomerSummaryDTO {
  id: string
  fullName: string
  email?: string | null
  phone?: string | null
  isActive: boolean
}

export interface CustomerWithStatsDTO extends CustomerDTO {
  stats: {
    totalPurchases: number
    totalSpent: number
    lastPurchaseDate?: Date | null
    averageTicket: number
  }
}

export interface CustomerStatsDTO {
  customerId: string
  totalPurchases: number
  totalSpent: number
  lastPurchaseDate?: Date | null
  averageTicket: number
  purchaseHistory: Array<{
    saleId: string
    saleNumber: string
    date: Date
    total: number
  }>
}
