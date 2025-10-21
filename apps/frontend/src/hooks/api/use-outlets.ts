import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { outletsService } from '@/services/outlets.service'
import { toast } from '@/hooks/use-toast'

// Query keys para organizar el cache
export const outletKeys = {
  all: ['outlets'] as const,
  lists: () => [...outletKeys.all, 'list'] as const,
  list: (filters?: any) => [...outletKeys.lists(), filters] as const,
  details: () => [...outletKeys.all, 'detail'] as const,
  detail: (id: string) => [...outletKeys.details(), id] as const,
}

/**
 * Get all outlets
 */
export const useOutlets = () => {
  return useQuery({
    queryKey: outletKeys.lists(),
    queryFn: outletsService.getAll,
  })
}

/**
 * Get outlet by ID
 */
export const useOutlet = (id: string) => {
  return useQuery({
    queryKey: outletKeys.detail(id),
    queryFn: () => outletsService.getById(id),
    enabled: !!id,
  })
}

/**
 * Create outlet mutation
 */
export const useCreateOutlet = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: any) => outletsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: outletKeys.lists() })
      toast({
        title: 'Sucursal creada',
        description: 'La sucursal ha sido creada exitosamente',
        variant: 'success',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo crear la sucursal',
        variant: 'destructive',
      })
    },
  })
}

/**
 * Update outlet mutation
 */
export const useUpdateOutlet = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      outletsService.update(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: outletKeys.lists() })
      queryClient.invalidateQueries({
        queryKey: outletKeys.detail(variables.id),
      })
      toast({
        title: 'Sucursal actualizada',
        description: 'La sucursal ha sido actualizada exitosamente',
        variant: 'success',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo actualizar la sucursal',
        variant: 'destructive',
      })
    },
  })
}

/**
 * Delete outlet mutation
 */
export const useDeleteOutlet = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => outletsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: outletKeys.lists() })
      toast({
        title: 'Sucursal eliminada',
        description: 'La sucursal ha sido eliminada exitosamente',
        variant: 'success',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo eliminar la sucursal',
        variant: 'destructive',
      })
    },
  })
}
