/**
 * Cart Data Transfer Objects
 * DTOs for Cart module - used for communication between layers
 */

export interface CartItemDTO {
  id: string
  cartId: string
  productId: string
  productName: string
  productBarcode?: string | null
  quantity: number
  unitPrice: number
  totalPrice: number
  createdAt: Date
}

export interface CartDTO {
  id: string
  userId: string
  outletId: string
  customerId?: string | null
  customerName?: string | null
  name?: string | null
  status: string
  subtotal: number
  discount: number
  total: number
  syncStatus: string
  createdAt: Date
  updatedAt: Date
  items: CartItemDTO[]
}

export interface CartSummaryDTO {
  id: string
  name?: string | null
  customerName?: string | null
  itemCount: number
  total: number
  status: string
  updatedAt: Date
}
