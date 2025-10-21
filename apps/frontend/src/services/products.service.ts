import apiClient from '@/lib/api-client'
import type { ProductDTO } from 'shared-types'

export const productService = {
  /**
   * Get all products
   */
  getAll: async (params?: { limit?: number; outletId?: string }): Promise<ProductDTO[]> => {
    const queryParams = new URLSearchParams()
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.outletId) queryParams.append('outletId', params.outletId)

    const queryString = queryParams.toString()
    return await apiClient.get(`/products${queryString ? `?${queryString}` : ''}`)
  },

  /**
   * Get product by ID
   */
  getById: async (id: string): Promise<ProductDTO> => {
    return await apiClient.get(`/products/${id}`)
  },

  /**
   * Get product by barcode
   */
  getByBarcode: async (barcode: string): Promise<ProductDTO> => {
    return await apiClient.get(`/products/barcode/${barcode}`)
  },

  /**
   * Create new product
   */
  create: async (data: any): Promise<ProductDTO> => {
    return await apiClient.post('/products', data)
  },

  /**
   * Update product
   */
  update: async (id: string, data: any): Promise<ProductDTO> => {
    return await apiClient.put(`/products/${id}`, data)
  },

  /**
   * Delete product
   */
  delete: async (id: string): Promise<void> => {
    return await apiClient.delete(`/products/${id}`)
  },
}
