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

    const response = await apiClient.get(`/products${queryString ? `?${queryString}` : ''}`)
    return response.data || [] 
  },

  /**
   * Get product by ID
   */
  getById: async (id: string): Promise<ProductDTO> => {
    const response = await apiClient.get(`/products/${id}`)
    return response.data || []
  },

  /**
   * Get product by barcode
   */
  getByBarcode: async (barcode: string): Promise<ProductDTO> => {
    const response = await apiClient.get(`/products/barcode/${barcode}`)
    return response.data || []
  },

  /**
   * Create new product
   */
  create: async (data: any): Promise<ProductDTO> => {
    const response = await apiClient.post('/products', data)
    return response.data || []
  },

  /**
   * Update product
   */
  update: async (id: string, data: any): Promise<ProductDTO> => {
    const response = await apiClient.put(`/products/${id}`, data)
    return response.data || []
  },

  /**
   * Delete product
   */
  delete: async (id: string): Promise<void> => {
    const response = await apiClient.delete(`/products/${id}`)
    return response.data || []
  },
}
