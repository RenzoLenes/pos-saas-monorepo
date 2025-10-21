/**
 * Tenant Data Transfer Objects
 * DTOs for Tenant module - used for communication between layers
 */

export interface TenantDTO {
  id: string
  name: string
  subdomain: string
  domain?: string | null
  plan: string
  status: string
  createdAt: Date
  updatedAt: Date
}

export interface TenantSummaryDTO {
  id: string
  name: string
  subdomain: string
  plan: string
  status: string
}

export interface TenantWithStatsDTO extends TenantDTO {
  outletsCount?: number
  usersCount?: number
  productsCount?: number
  customersCount?: number
}
