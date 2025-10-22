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
    const response = await apiClient.get('/sales', { params })
    return response.data || []
  },

  /**
   * Get sale by ID
   */
  getById: async (id: string): Promise<SaleDTO> => {
    const response = await apiClient.get(`/sales/${id}`)
    return response.data || []
  },

  /**
   * Complete sale (checkout)
   */
  complete: async (data: any): Promise<SaleDTO> => {
    const response = await apiClient.post('/sales/complete', data)
    return response.data || []
  },

  /**
   * Void sale
   */
  void: async (id: string): Promise<SaleDTO> => {
    const response = await apiClient.post(`/sales/${id}/void`)
    return response.data || []
  },

  /**
   * Refund sale
   */
  refund: async (id: string, amount: number): Promise<SaleDTO> => {
    const response = await apiClient.post(`/sales/${id}/refund`, { amount })
    return response.data || []
  },

  /**
   * Get sales by date range
   */
  getByDateRange: async (
    startDate: string,
    endDate: string,
    outletId?: string
  ): Promise<SaleDTO[]> => {

    const response = await apiClient.get('/sales', {
      params: { startDate, endDate, outletId },
    })
    return response.data || []
  },

  /**
   * Get period summary
   */
  getPeriodSummary: async (params: {
    startDate: string
    endDate: string
    outletId?: string
  }): Promise<any> => {
    const response = await apiClient.get('/sales/summary/period', { params })
    return response.data || []
  },
}
