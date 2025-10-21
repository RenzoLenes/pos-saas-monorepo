// Common API Response Types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: ApiError
  message?: string
}

export interface ApiError {
  code: string
  message: string
  details?: Record<string, any>
}

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  pagination: PaginationMeta
}

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

// Note: UserRole, CartStatus, and PaymentMethod are defined in Prisma schema
// They will be exported from the validators which import them from @prisma/client

// Sync Status
export enum SyncStatus {
  SYNCED = 'synced',
  PENDING = 'pending',
  FAILED = 'failed',
}

// Entity Status
export enum EntityStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

// Tenant Plan
export enum TenantPlan {
  BASIC = 'basic',
  PREMIUM = 'premium',
  ENTERPRISE = 'enterprise',
}

// Date Range
export interface DateRange {
  start: Date | string
  end: Date | string
}

// Filter Options
export interface FilterOptions {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  search?: string
}
