import apiClient from '@/lib/api-client'
import type { InventoryDTO } from 'shared-types'

export const inventoryService = {
  /**
   * Get inventory by outlet
   */
  getByOutlet: async (outletId: string): Promise<InventoryDTO[]> => {
    
    const response = await apiClient.get('/inventory', {
      params: { outletId },
    })
    return response.data || []
  },

  /**
   * Get inventory by ID
   */
  getById: async (id: string): Promise<InventoryDTO> => {
    const response = await apiClient.get(`/inventory/${id}`)
    return response.data || []
  },

  /**
   * Update stock
   */
  updateStock: async (data: any): Promise<InventoryDTO> => {
    const response = await apiClient.put('/inventory/stock', data)
    return response.data || []
  },

  /**
   * Transfer inventory between outlets
   */
  transfer: async (data: any): Promise<void> => {
    const response = await apiClient.post('/inventory/transfer', data)
    return response.data || []
  },

  /**
   * Get low stock items
   */
  getLowStock: async (outletId: string): Promise<InventoryDTO[]> => {
    const response = await apiClient.get('/inventory/low-stock', {
      params: { outletId },
    })
    return response.data || []
  },

  /**
   * Bulk update stock
   */
  bulkUpdate: async (updates: any[]): Promise<InventoryDTO[]> => {
    const response = await apiClient.post('/inventory/bulk-update', { updates })
    return response.data || []
  },
}
