import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from '@/hooks/use-toast'
import { productService } from '@/services/products.service';

// Query keys para organizar el cache
export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (filters?: any) => [...productKeys.lists(), filters] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
  byBarcode: (barcode: string) =>
    [...productKeys.all, 'barcode', barcode] as const,
}

/**
 * Get all products
 */
export const useProducts = (filters?: { limit?: number; outletId?: string }) => {
  return useQuery({
    queryKey: productKeys.list(filters),
    queryFn: () => productService.getAll(filters),
    enabled: !filters?.outletId || !!filters.outletId,
  })
}

/**
 * Get product by ID
 */
export const useProduct = (id: string) => {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => productService.getById(id),
    enabled: !!id,
  })
}

/**
 * Get product by barcode
 */
export const useProductByBarcode = (barcode: string) => {
  return useQuery({
    queryKey: productKeys.byBarcode(barcode),
    queryFn: () => productService.getByBarcode(barcode),
    enabled: !!barcode,
  })
}

/**
 * Create product mutation
 */
export const useCreateProduct = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: any) => productService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() })
      toast({
        title: 'Producto creado',
        description: 'El producto ha sido creado exitosamente',
        variant: 'success',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo crear el producto',
        variant: 'destructive',
      })
    },
  })
}

/**
 * Update product mutation
 */
export const useUpdateProduct = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      productService.update(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() })
      queryClient.invalidateQueries({
        queryKey: productKeys.detail(variables.id),
      })
      toast({
        title: 'Producto actualizado',
        description: 'El producto ha sido actualizado exitosamente',
        variant: 'success',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo actualizar el producto',
        variant: 'destructive',
      })
    },
  })
}

/**
 * Delete product mutation
 */
export const useDeleteProduct = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => productService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() })
      toast({
        title: 'Producto eliminado',
        description: 'El producto ha sido eliminado exitosamente',
        variant: 'success',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo eliminar el producto',
        variant: 'destructive',
      })
    },
  })
}
