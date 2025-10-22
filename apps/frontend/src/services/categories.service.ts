import apiClient from '@/lib/api-client'
import type { CategoryDTO } from 'shared-types'

export const categoriesService = {
  /**
   * Get all categories
   */
  getAll: async (): Promise<CategoryDTO[]> => {
    const response = await apiClient.get('/categories')
    return response.data || []
  },

  /**
   * Get category by ID
   */
  getById: async (id: string): Promise<CategoryDTO> => {
    const response = await apiClient.get(`/categories/${id}`)
    return response.data || []
  },

  /**
   * Create new category
   */
  create: async (data: any): Promise<CategoryDTO> => {
    const response = await apiClient.post('/categories', data)
    return response.data || []
  },

  /**
   * Update category
   */
  update: async (id: string, data: any): Promise<CategoryDTO> => {
    const response = await apiClient.put(`/categories/${id}`, data)
    return response.data || []
  },

  /**
   * Delete category
   */
  delete: async (id: string): Promise<void> => {
    const response = await apiClient.delete(`/categories/${id}`)
    return response.data || []
  },
}
