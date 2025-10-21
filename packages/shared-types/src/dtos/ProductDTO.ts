/**
 * Product Data Transfer Objects
 * DTOs for Product module - used for communication between layers
 */

export interface ProductDTO {
  id: string
  name: string
  description?: string | null
  price: number
  barcode?: string | null
  sku?: string | null
  categoryId?: string | null
  categoryName?: string | null
  isCustom: boolean
  tenantId: string
  createdAt: Date
  updatedAt: Date
  isActive: boolean
}

export interface ProductSummaryDTO {
  id: string
  name: string
  price: number
  barcode?: string | null
  categoryName?: string | null
  isCustom: boolean
}

export interface ProductWithInventoryDTO extends ProductDTO {
  inventory?: Array<{
    outletId: string
    outletName: string
    quantity: number
    minStock: number
  }>
}
