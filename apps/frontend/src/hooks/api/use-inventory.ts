import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { inventoryService } from '@/services/inventory.service'
import { toast } from '@/hooks/use-toast'

// Query keys para organizar el cache
export const inventoryKeys = {
  all: ['inventory'] as const,
  byOutlet: (outletId: string) => [...inventoryKeys.all, 'outlet', outletId] as const,
  lowStock: (outletId: string) =>
    [...inventoryKeys.all, 'low-stock', outletId] as const,
  details: () => [...inventoryKeys.all, 'detail'] as const,
  detail: (id: string) => [...inventoryKeys.details(), id] as const,
}

/**
 * Get inventory by outlet
 */
export const useInventoryByOutlet = (outletId: string) => {
  return useQuery({
    queryKey: inventoryKeys.byOutlet(outletId),
    queryFn: () => inventoryService.getByOutlet(outletId),
    enabled: !!outletId,
  })
}

/**
 * Get inventory by ID
 */
export const useInventory = (id: string) => {
  return useQuery({
    queryKey: inventoryKeys.detail(id),
    queryFn: () => inventoryService.getById(id),
    enabled: !!id,
  })
}

/**
 * Get low stock items
 */
export const useLowStockItems = (outletId: string) => {
  return useQuery({
    queryKey: inventoryKeys.lowStock(outletId),
    queryFn: () => inventoryService.getLowStock(outletId),
    enabled: !!outletId,
  })
}

/**
 * Update stock mutation
 */
export const useUpdateStock = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: any) => inventoryService.updateStock(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all })
      toast({
        title: 'Stock actualizado',
        description: 'El stock ha sido actualizado exitosamente',
        variant: 'success',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo actualizar el stock',
        variant: 'destructive',
      })
    },
  })
}

/**
 * Transfer inventory mutation
 */
export const useTransferInventory = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: any) => inventoryService.transfer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all })
      toast({
        title: 'Transferencia completada',
        description: 'El inventario ha sido transferido exitosamente',
        variant: 'success',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo transferir el inventario',
        variant: 'destructive',
      })
    },
  })
}

/**
 * Bulk update stock mutation
 */
export const useBulkUpdateStock = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (updates: any[]) => inventoryService.bulkUpdate(updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all })
      toast({
        title: 'Stock actualizado',
        description: 'Se han actualizado múltiples items de inventario',
        variant: 'success',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description:
          error.message || 'No se pudo actualizar el stock en lote',
        variant: 'destructive',
      })
    },
  })
}
