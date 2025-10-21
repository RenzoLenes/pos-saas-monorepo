/**
 * Category Data Transfer Objects
 * DTOs for Category module - used for communication between layers
 */

export interface CategoryDTO {
  id: string
  name: string
  description?: string | null
  tenantId: string
  createdAt: Date
  updatedAt: Date
}

export interface CategorySummaryDTO {
  id: string
  name: string
  description?: string | null
}

export interface CategoryWithProductsDTO extends CategoryDTO {
  productsCount?: number
  products?: Array<{
    id: string
    name: string
    price: number
  }>
}
