import apiClient from '@/lib/api-client'
import type { CategoryDTO } from 'shared-types'

export const categoriesService = {
  /**
   * Get all categories
   */
  getAll: async (): Promise<CategoryDTO[]> => {
    return await apiClient.get('/categories')
  },

  /**
   * Get category by ID
   */
  getById: async (id: string): Promise<CategoryDTO> => {
    return await apiClient.get(`/categories/${id}`)
  },

  /**
   * Create new category
   */
  create: async (data: any): Promise<CategoryDTO> => {
    return await apiClient.post('/categories', data)
  },

  /**
   * Update category
   */
  update: async (id: string, data: any): Promise<CategoryDTO> => {
    return await apiClient.put(`/categories/${id}`, data)
  },

  /**
   * Delete category
   */
  delete: async (id: string): Promise<void> => {
    return await apiClient.delete(`/categories/${id}`)
  },
}
