import apiClient from '@/lib/api-client'
import type { InventoryDTO } from 'shared-types'

export const inventoryService = {
  /**
   * Get inventory by outlet
   */
  getByOutlet: async (outletId: string): Promise<InventoryDTO[]> => {
    return await apiClient.get('/inventory', {
      params: { outletId },
    })
  },

  /**
   * Get inventory by ID
   */
  getById: async (id: string): Promise<InventoryDTO> => {
    return await apiClient.get(`/inventory/${id}`)
  },

  /**
   * Update stock
   */
  updateStock: async (data: any): Promise<InventoryDTO> => {
    return await apiClient.put('/inventory/stock', data)
  },

  /**
   * Transfer inventory between outlets
   */
  transfer: async (data: any): Promise<void> => {
    return await apiClient.post('/inventory/transfer', data)
  },

  /**
   * Get low stock items
   */
  getLowStock: async (outletId: string): Promise<InventoryDTO[]> => {
    return await apiClient.get('/inventory/low-stock', {
      params: { outletId },
    })
  },

  /**
   * Bulk update stock
   */
  bulkUpdate: async (updates: any[]): Promise<InventoryDTO[]> => {
    return await apiClient.post('/inventory/bulk-update', { updates })
  },
}
