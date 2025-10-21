import apiClient from '@/lib/api-client'
import type { SaleDTO } from 'shared-types'

export const salesService = {
  /**
   * Get all sales
   */
  getAll: async (params?: {
    outletId?: string
    startDate?: string
    endDate?: string
    limit?: number
  }): Promise<SaleDTO[]> => {
    return await apiClient.get('/sales', { params })
  },

  /**
   * Get sale by ID
   */
  getById: async (id: string): Promise<SaleDTO> => {
    return await apiClient.get(`/sales/${id}`)
  },

  /**
   * Complete sale (checkout)
   */
  complete: async (data: any): Promise<SaleDTO> => {
    return await apiClient.post('/sales/complete', data)
  },

  /**
   * Void sale
   */
  void: async (id: string): Promise<SaleDTO> => {
    return await apiClient.post(`/sales/${id}/void`)
  },

  /**
   * Refund sale
   */
  refund: async (id: string, amount: number): Promise<SaleDTO> => {
    return await apiClient.post(`/sales/${id}/refund`, { amount })
  },

  /**
   * Get sales by date range
   */
  getByDateRange: async (
    startDate: string,
    endDate: string,
    outletId?: string
  ): Promise<SaleDTO[]> => {
    return await apiClient.get('/sales', {
      params: { startDate, endDate, outletId },
    })
  },

  /**
   * Get period summary
   */
  getPeriodSummary: async (params: {
    startDate: string
    endDate: string
    outletId?: string
  }): Promise<any> => {
    return await apiClient.get('/sales/summary/period', { params })
  },
}
