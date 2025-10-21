import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { salesService } from '@/services/sales.service'
import { toast } from '@/hooks/use-toast'

// Query keys para organizar el cache
export const saleKeys = {
  all: ['sales'] as const,
  lists: () => [...saleKeys.all, 'list'] as const,
  list: (filters?: any) => [...saleKeys.lists(), filters] as const,
  details: () => [...saleKeys.all, 'detail'] as const,
  detail: (id: string) => [...saleKeys.details(), id] as const,
}

/**
 * Get all sales
 */
export const useSales = (params?: {
  outletId?: string
  startDate?: string
  endDate?: string
  limit?: number
}) => {
  return useQuery({
    queryKey: saleKeys.list(params),
    queryFn: () => salesService.getAll(params),
  })
}

/**
 * Get sale by ID
 */
export const useSale = (id: string) => {
  return useQuery({
    queryKey: saleKeys.detail(id),
    queryFn: () => salesService.getById(id),
    enabled: !!id,
  })
}

/**
 * Complete sale (checkout) mutation
 */
export const useCompleteSale = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: any) => salesService.complete(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: saleKeys.lists() })
      toast({
        title: 'Venta completada',
        description: 'La venta ha sido procesada exitosamente',
        variant: 'success',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo completar la venta',
        variant: 'destructive',
      })
    },
  })
}

/**
 * Void sale mutation
 */
export const useVoidSale = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => salesService.void(id),
    onSuccess: (data, saleId) => {
      queryClient.invalidateQueries({ queryKey: saleKeys.lists() })
      queryClient.invalidateQueries({ queryKey: saleKeys.detail(saleId) })
      toast({
        title: 'Venta anulada',
        description: 'La venta ha sido anulada',
        variant: 'success',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo anular la venta',
        variant: 'destructive',
      })
    },
  })
}

/**
 * Refund sale mutation
 */
export const useRefundSale = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, amount }: { id: string; amount: number }) =>
      salesService.refund(id, amount),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: saleKeys.lists() })
      queryClient.invalidateQueries({ queryKey: saleKeys.detail(variables.id) })
      toast({
        title: 'Reembolso procesado',
        description: 'El reembolso ha sido procesado exitosamente',
        variant: 'success',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo procesar el reembolso',
        variant: 'destructive',
      })
    },
  })
}

/**
 * Get sales by date range
 */
export const useSalesByDateRange = (
  startDate: string,
  endDate: string,
  outletId?: string
) => {
  return useQuery({
    queryKey: saleKeys.list({ startDate, endDate, outletId }),
    queryFn: () => salesService.getByDateRange(startDate, endDate, outletId),
    enabled: !!startDate && !!endDate,
  })
}

/**
 * Get period summary
 */
export const useSalesSummary = (params: {
  startDate: Date
  endDate: Date
  outletId?: string
}) => {
  return useQuery({
    queryKey: [...saleKeys.all, 'summary', params],
    queryFn: () => salesService.getPeriodSummary({
      startDate: params.startDate.toISOString(),
      endDate: params.endDate.toISOString(),
      outletId: params.outletId,
    }),
    enabled: !!params.startDate && !!params.endDate && !!params.outletId,
  })
}
