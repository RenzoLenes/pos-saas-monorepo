import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { customersService } from '@/services/customers.service'
import { toast } from '@/hooks/use-toast'

// Query keys para organizar el cache
export const customerKeys = {
  all: ['customers'] as const,
  lists: () => [...customerKeys.all, 'list'] as const,
  list: (filters?: any) => [...customerKeys.lists(), filters] as const,
  details: () => [...customerKeys.all, 'detail'] as const,
  detail: (id: string) => [...customerKeys.details(), id] as const,
  salesHistory: (id: string) => [...customerKeys.all, 'sales', id] as const,
}

/**
 * Get all customers (uses authenticated user's tenantId)
 */
export const useCustomers = () => {
  return useQuery({
    queryKey: customerKeys.lists(),
    queryFn: () => customersService.getAll(),
  })
}

/**
 * Get customer by ID
 */
export const useCustomer = (id: string) => {
  return useQuery({
    queryKey: customerKeys.detail(id),
    queryFn: () => customersService.getById(id),
    enabled: !!id,
  })
}

/**
 * Get customer sales history
 */
export const useCustomerSalesHistory = (id: string) => {
  return useQuery({
    queryKey: customerKeys.salesHistory(id),
    queryFn: () => customersService.getSalesHistory(id),
    enabled: !!id,
  })
}

/**
 * Create customer mutation
 */
export const useCreateCustomer = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: any) => customersService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() })
      toast({
        title: 'Cliente creado',
        description: 'El cliente ha sido creado exitosamente',
        variant: 'success',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo crear el cliente',
        variant: 'destructive',
      })
    },
  })
}

/**
 * Update customer mutation
 */
export const useUpdateCustomer = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      customersService.update(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() })
      queryClient.invalidateQueries({
        queryKey: customerKeys.detail(variables.id),
      })
      toast({
        title: 'Cliente actualizado',
        description: 'El cliente ha sido actualizado exitosamente',
        variant: 'success',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo actualizar el cliente',
        variant: 'destructive',
      })
    },
  })
}

/**
 * Delete customer mutation
 */
export const useDeleteCustomer = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => customersService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() })
      toast({
        title: 'Cliente eliminado',
        description: 'El cliente ha sido eliminado exitosamente',
        variant: 'success',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo eliminar el cliente',
        variant: 'destructive',
      })
    },
  })
}
