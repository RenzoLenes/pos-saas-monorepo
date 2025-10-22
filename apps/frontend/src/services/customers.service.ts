import apiClient from '@/lib/api-client'
import type { CustomerDTO } from 'shared-types'

export const customersService = {
  /**
   * Get all customers (uses authenticated user's tenantId)
   */
  getAll: async (): Promise<CustomerDTO[]> => {
    const response = await apiClient.get('/customers/search')
    return response.data || []
  },

  /**
   * Get customer by ID
   */
  getById: async (id: string): Promise<CustomerDTO> => {
    const response = await apiClient.get(`/customers/${id}`)
    return response.data || []
  },

  /**
   * Create new customer
   */
  create: async (data: any): Promise<CustomerDTO> => {
    const response = await apiClient.post('/customers', data)
    return response.data || []
  },

  /**
   * Update customer
   */
  update: async (id: string, data: any): Promise<CustomerDTO> => {
    const response = await apiClient.put(`/customers/${id}`, data)
    return response.data || []
  },

  /**
   * Delete customer
   */
  delete: async (id: string): Promise<void> => {
    const response = await apiClient.delete(`/customers/${id}`)
    return response.data || []
  },

  /**
   * Get customer sales history
   */
  getSalesHistory: async (id: string): Promise<any[]> => {
    const response = await apiClient.get(`/customers/${id}/sales`)
    return response.data || []
  },
}
