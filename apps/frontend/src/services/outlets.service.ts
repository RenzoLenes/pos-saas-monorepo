import apiClient from '@/lib/api-client'
import type { OutletDTO } from 'shared-types'

export const outletsService = {
  /**
   * Get all outlets
   */
  getAll: async (): Promise<OutletDTO[]> => {
    const response = await apiClient.get('/outlets')
    // 🔥 Asegura que retorne SIEMPRE un arreglo
    return response.data || []
  },

  /**
   * Get outlet by ID
   */
  getById: async (id: string): Promise<OutletDTO> => {
    const response = await apiClient.get(`/outlets/${id}`)
    return response.data || []
  },

  /**
   * Create new outlet
   */
  create: async (data: any): Promise<OutletDTO> => {
    const response = await apiClient.post('/outlets', data)
    return response.data || []
  },

  /**
   * Update outlet
   */
  update: async (id: string, data: any): Promise<OutletDTO> => {
    const response = await apiClient.put(`/outlets/${id}`, data)
    return response.data || []
  },

  /**
   * Delete outlet
   */
  delete: async (id: string): Promise<void> => {
    const response = await apiClient.delete(`/outlets/${id}`)
    return response.data || []
  },
}
