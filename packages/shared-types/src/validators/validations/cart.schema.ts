import { z } from 'zod'

/**
 * Cart Validation Schemas
 * Centralized validation schemas for cart-related operations
 */

// Create cart schema
export const createCartSchema = z.object({
  outletId: z.string().cuid('ID de outlet inválido'),
  name: z.string().max(100, 'El nombre es muy largo').optional(),
  customerId: z.string().cuid('ID de cliente inválido').optional(),
})

// Add item to cart schema
export const addItemToCartSchema = z.object({
  cartId: z.string().cuid('ID de carrito inválido'),
  productId: z.string().cuid('ID de producto inválido'),
  quantity: z.number().int().positive('La cantidad debe ser un número entero positivo'),
})

// Update cart item schema
export const updateCartItemSchema = z.object({
  itemId: z.string().cuid('ID de item inválido'),
  quantity: z.number().int().positive('La cantidad debe ser un número entero positivo'),
})

// Remove item from cart schema
export const removeItemFromCartSchema = z.object({
  itemId: z.string().cuid('ID de item inválido'),
})

// Update cart discount schema
export const updateCartDiscountSchema = z.object({
  cartId: z.string().cuid('ID de carrito inválido'),
  discount: z.number().min(0, 'El descuento debe ser mayor o igual a 0').max(100, 'El descuento no puede ser mayor a 100%'),
})

// Update cart customer schema
export const updateCartCustomerSchema = z.object({
  cartId: z.string().cuid('ID de carrito inválido'),
  customerId: z.string().cuid('ID de cliente inválido').nullable(),
})

// Get cart by ID schema
export const getCartByIdSchema = z.object({
  cartId: z.string().cuid('ID de carrito inválido'),
})

// Clear cart schema
export const clearCartSchema = z.object({
  cartId: z.string().cuid('ID de carrito inválido'),
})

// Get my carts query schema
export const getMyCartsQuerySchema = z.object({
  outletId: z.string().cuid('ID de outlet inválido').optional(),
})

// Hold cart schema
export const holdCartSchema = z.object({
  cartId: z.string().cuid('ID de carrito inválido'),
  name: z.string().max(100, 'El nombre es muy largo').optional(),
})

// Activate cart schema
export const activateCartSchema = z.object({
  cartId: z.string().cuid('ID de carrito inválido'),
})

// Delete cart schema
export const deleteCartSchema = z.object({
  cartId: z.string().cuid('ID de carrito inválido'),
})

// Type exports
export type CreateCartInput = z.infer<typeof createCartSchema>
export type AddItemToCartInput = z.infer<typeof addItemToCartSchema>
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>
export type RemoveItemFromCartInput = z.infer<typeof removeItemFromCartSchema>
export type UpdateCartDiscountInput = z.infer<typeof updateCartDiscountSchema>
export type UpdateCartCustomerInput = z.infer<typeof updateCartCustomerSchema>
export type GetCartByIdInput = z.infer<typeof getCartByIdSchema>
export type ClearCartInput = z.infer<typeof clearCartSchema>
export type GetMyCartsQueryInput = z.infer<typeof getMyCartsQuerySchema>
export type HoldCartInput = z.infer<typeof holdCartSchema>
export type ActivateCartInput = z.infer<typeof activateCartSchema>
export type DeleteCartInput = z.infer<typeof deleteCartSchema>
