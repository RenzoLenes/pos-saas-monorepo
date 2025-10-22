import apiClient from '@/lib/api-client'
import type { TenantDTO } from 'shared-types'

export const tenantsService = {
  /**
   * Get current tenant
   */
  getCurrent: async (): Promise<TenantDTO> => {
    const response = await apiClient.get('/tenants/current')
    return response.data || []
  },

  /**
   * Check subdomain availability
   */
  checkSubdomain: async (subdomain: string): Promise<{ available: boolean }> => {
    const response = await apiClient.get(`/tenants/check-subdomain/${subdomain}`)
    return response.data || []
  },

  /**
   * Create new tenant
   */
  create: async (data: any): Promise<TenantDTO> => {
    const response = await apiClient.post('/tenants', data)
    return response.data || []
  },

  /**
   * Update tenant
   */
  update: async (id: string, data: any): Promise<TenantDTO> => {
    const response = await apiClient.put(`/tenants/${id}`, data)
    return response.data || []
  },

  /**
   * Delete tenant
   */
  delete: async (id: string): Promise<void> => {
    const response = await apiClient.delete(`/tenants/${id}`)
    return response.data || []
  },
}
