import apiClient from '@/lib/api-client'
import type { CartDTO } from 'shared-types'

export const cartService = {
  /**
   * Get all carts for current user
   */
  getMyCarts: async (outletId: string): Promise<CartDTO[]> => {
    const response = await apiClient.get('/carts', {
      params: { outletId },
    })
    return response.data || []
  },

  /**
   * Get cart by ID
   */
  getById: async (id: string): Promise<CartDTO> => {
    const response = await apiClient.get(`/carts/${id}`)
    return response.data || []
  },

  /**
   * Create new cart
   */
  create: async (data: any): Promise<CartDTO> => {
    const response = await apiClient.post('/carts', data)
    return response.data || []
  },

  /**
   * Add item to cart
   */
  addItem: async (cartId: string, data: any): Promise<CartDTO> => {
    const response = await apiClient.post(`/carts/${cartId}/items`, data)
    return response.data || []
  },

  /**
   * Update cart item
   */
  updateItem: async (
    cartId: string,
    itemId: string,
    data: any
  ): Promise<CartDTO> => {
    const response =  await apiClient.put(`/carts/${cartId}/items/${itemId}`, data)
    return response.data || []
  },

  /**
   * Remove item from cart
   */
  removeItem: async (cartId: string, itemId: string): Promise<void> => {
    const response = await apiClient.delete(`/carts/${cartId}/items/${itemId}`)
    return response.data || []
  },

  /**
   * Apply discount to cart
   */
  applyDiscount: async (cartId: string, discount: number): Promise<CartDTO> => {
    const response = await apiClient.put(`/carts/${cartId}/discount`, { discount })
    return response.data || []
  },

  /**
   * Hold cart
   */
  hold: async (cartId: string, name: string): Promise<CartDTO> => {
    const response = await apiClient.post(`/carts/${cartId}/hold`, { name })
    return response.data || []
  },

  /**
   * Activate held cart
   */
  activate: async (cartId: string): Promise<CartDTO> => {
    const response = await apiClient.post(`/carts/${cartId}/activate`)
    return response.data || []
  },

  /**
   * Delete cart
   */
  delete: async (cartId: string): Promise<void> => {
    const response = await apiClient.delete(`/carts/${cartId}`)
    return response.data || []
  },

  /**
   * Assign customer to cart
   */
  assignCustomer: async (
    cartId: string,
    customerId: string | null
  ): Promise<CartDTO> => {
    const response = await apiClient.put(`/carts/${cartId}/customer`, { customerId })
    return response.data || []
  },

  /**
   * Clear cart items
   */
  clear: async (cartId: string): Promise<CartDTO> => {
    const response = await apiClient.post(`/carts/${cartId}/clear`)
    return response.data || []
  },
}
