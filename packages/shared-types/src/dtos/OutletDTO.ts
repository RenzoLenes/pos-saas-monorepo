/**
 * Outlet Data Transfer Objects
 * DTOs for Outlet module - used for communication between layers
 */

export interface OutletDTO {
  id: string
  name: string
  address?: string | null
  phone?: string | null
  email?: string | null
  currency: string
  locale: string
  timezone: string
  status: string
  tenantId: string
  createdAt: Date
  updatedAt: Date
}

export interface OutletSummaryDTO {
  id: string
  name: string
  address?: string | null
  status: string
}
