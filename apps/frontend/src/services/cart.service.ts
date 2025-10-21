import apiClient from '@/lib/api-client'
import type { CartDTO } from 'shared-types'

export const cartService = {
  /**
   * Get all carts for current user
   */
  getMyCarts: async (outletId: string): Promise<CartDTO[]> => {
    return await apiClient.get('/carts', {
      params: { outletId },
    })
  },

  /**
   * Get cart by ID
   */
  getById: async (id: string): Promise<CartDTO> => {
    return await apiClient.get(`/carts/${id}`)
  },

  /**
   * Create new cart
   */
  create: async (data: any): Promise<CartDTO> => {
    return await apiClient.post('/carts', data)
  },

  /**
   * Add item to cart
   */
  addItem: async (cartId: string, data: any): Promise<CartDTO> => {
    return await apiClient.post(`/carts/${cartId}/items`, data)
  },

  /**
   * Update cart item
   */
  updateItem: async (
    cartId: string,
    itemId: string,
    data: any
  ): Promise<CartDTO> => {
    return await apiClient.put(`/carts/${cartId}/items/${itemId}`, data)
  },

  /**
   * Remove item from cart
   */
  removeItem: async (cartId: string, itemId: string): Promise<void> => {
    return await apiClient.delete(`/carts/${cartId}/items/${itemId}`)
  },

  /**
   * Apply discount to cart
   */
  applyDiscount: async (cartId: string, discount: number): Promise<CartDTO> => {
    return await apiClient.put(`/carts/${cartId}/discount`, { discount })
  },

  /**
   * Hold cart
   */
  hold: async (cartId: string, name: string): Promise<CartDTO> => {
    return await apiClient.post(`/carts/${cartId}/hold`, { name })
  },

  /**
   * Activate held cart
   */
  activate: async (cartId: string): Promise<CartDTO> => {
    return await apiClient.post(`/carts/${cartId}/activate`)
  },

  /**
   * Delete cart
   */
  delete: async (cartId: string): Promise<void> => {
    return await apiClient.delete(`/carts/${cartId}`)
  },

  /**
   * Assign customer to cart
   */
  assignCustomer: async (
    cartId: string,
    customerId: string | null
  ): Promise<CartDTO> => {
    return await apiClient.put(`/carts/${cartId}/customer`, { customerId })
  },

  /**
   * Clear cart items
   */
  clear: async (cartId: string): Promise<CartDTO> => {
    return await apiClient.post(`/carts/${cartId}/clear`)
  },
}
