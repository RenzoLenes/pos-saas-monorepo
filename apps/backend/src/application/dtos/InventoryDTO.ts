/**
 * Inventory Data Transfer Objects
 * DTOs for Inventory module - used for communication between layers
 */

export interface InventoryDTO {
  id: string
  productId: string
  productName: string
  productBarcode?: string | null
  outletId: string
  outletName?: string
  quantity: number
  minStock: number
  maxStock: number | null
}

export interface InventorySummaryDTO {
  productId: string
  productName: string
  totalQuantity: number
  minStock: number
  outlets: Array<{
    outletId: string
    outletName: string
    quantity: number
  }>
}

export interface LowStockItemDTO {
  productId: string
  productName: string
  productBarcode?: string | null
  outletId: string
  outletName: string
  currentQuantity: number
  minStock: number
  deficit: number
}

export interface InventoryMovementDTO {
  id: string
  productId: string
  productName: string
  fromOutletId?: string | null
  fromOutletName?: string | null
  toOutletId?: string | null
  toOutletName?: string | null
  quantity: number
  movementType: 'transfer' | 'adjustment' | 'sale' | 'restock'
  notes?: string | null
  userId: string
  userName?: string
  createdAt: Date
}
