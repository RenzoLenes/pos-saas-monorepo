import apiClient from '@/lib/api-client'
import type { CustomerDTO } from 'shared-types'

export const customersService = {
  /**
   * Get all customers (uses authenticated user's tenantId)
   */
  getAll: async (): Promise<CustomerDTO[]> => {
    const response = await apiClient.get('/customers/search')
    return response.data
  },

  /**
   * Get customer by ID
   */
  getById: async (id: string): Promise<CustomerDTO> => {
    return await apiClient.get(`/customers/${id}`)
  },

  /**
   * Create new customer
   */
  create: async (data: any): Promise<CustomerDTO> => {
    return await apiClient.post('/customers', data)
  },

  /**
   * Update customer
   */
  update: async (id: string, data: any): Promise<CustomerDTO> => {
    return await apiClient.put(`/customers/${id}`, data)
  },

  /**
   * Delete customer
   */
  delete: async (id: string): Promise<void> => {
    return await apiClient.delete(`/customers/${id}`)
  },

  /**
   * Get customer sales history
   */
  getSalesHistory: async (id: string): Promise<any[]> => {
    return await apiClient.get(`/customers/${id}/sales`)
  },
}
