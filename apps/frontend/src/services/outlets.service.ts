import apiClient from '@/lib/api-client'
import type { OutletDTO } from 'shared-types'

export const outletsService = {
  /**
   * Get all outlets
   */
  getAll: async (): Promise<OutletDTO[]> => {
    return await apiClient.get('/outlets')
  },

  /**
   * Get outlet by ID
   */
  getById: async (id: string): Promise<OutletDTO> => {
    return await apiClient.get(`/outlets/${id}`)
  },

  /**
   * Create new outlet
   */
  create: async (data: any): Promise<OutletDTO> => {
    return await apiClient.post('/outlets', data)
  },

  /**
   * Update outlet
   */
  update: async (id: string, data: any): Promise<OutletDTO> => {
    return await apiClient.put(`/outlets/${id}`, data)
  },

  /**
   * Delete outlet
   */
  delete: async (id: string): Promise<void> => {
    return await apiClient.delete(`/outlets/${id}`)
  },
}
