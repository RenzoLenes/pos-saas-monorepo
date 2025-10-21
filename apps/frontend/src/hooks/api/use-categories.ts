import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { categoriesService } from '@/services/categories.service'
import { toast } from '@/hooks/use-toast'

// Query keys para organizar el cache
export const categoryKeys = {
  all: ['categories'] as const,
  lists: () => [...categoryKeys.all, 'list'] as const,
  list: (filters?: any) => [...categoryKeys.lists(), filters] as const,
  details: () => [...categoryKeys.all, 'detail'] as const,
  detail: (id: string) => [...categoryKeys.details(), id] as const,
}

/**
 * Get all categories
 */
export const useCategories = () => {
  return useQuery({
    queryKey: categoryKeys.lists(),
    queryFn: categoriesService.getAll,
  })
}

/**
 * Get category by ID
 */
export const useCategory = (id: string) => {
  return useQuery({
    queryKey: categoryKeys.detail(id),
    queryFn: () => categoriesService.getById(id),
    enabled: !!id,
  })
}

/**
 * Create category mutation
 */
export const useCreateCategory = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: any) => categoriesService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() })
      toast({
        title: 'Categoría creada',
        description: 'La categoría ha sido creada exitosamente',
        variant: 'success',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo crear la categoría',
        variant: 'destructive',
      })
    },
  })
}

/**
 * Update category mutation
 */
export const useUpdateCategory = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      categoriesService.update(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() })
      queryClient.invalidateQueries({
        queryKey: categoryKeys.detail(variables.id),
      })
      toast({
        title: 'Categoría actualizada',
        description: 'La categoría ha sido actualizada exitosamente',
        variant: 'success',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo actualizar la categoría',
        variant: 'destructive',
      })
    },
  })
}

/**
 * Delete category mutation
 */
export const useDeleteCategory = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => categoriesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() })
      toast({
        title: 'Categoría eliminada',
        description: 'La categoría ha sido eliminada exitosamente',
        variant: 'success',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo eliminar la categoría',
        variant: 'destructive',
      })
    },
  })
}
