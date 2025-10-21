import apiClient from '@/lib/api-client'
import type { TenantDTO } from 'shared-types'

export const tenantsService = {
  /**
   * Get current tenant
   */
  getCurrent: async (): Promise<TenantDTO> => {
    return await apiClient.get('/tenants/current')
  },

  /**
   * Check subdomain availability
   */
  checkSubdomain: async (subdomain: string): Promise<{ available: boolean }> => {
    return await apiClient.get(`/tenants/check-subdomain/${subdomain}`)
  },

  /**
   * Create new tenant
   */
  create: async (data: any): Promise<TenantDTO> => {
    return await apiClient.post('/tenants', data)
  },

  /**
   * Update tenant
   */
  update: async (id: string, data: any): Promise<TenantDTO> => {
    return await apiClient.put(`/tenants/${id}`, data)
  },

  /**
   * Delete tenant
   */
  delete: async (id: string): Promise<void> => {
    return await apiClient.delete(`/tenants/${id}`)
  },
}
