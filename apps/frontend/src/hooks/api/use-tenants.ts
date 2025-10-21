import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { tenantsService } from '@/services/tenants.service'
import { toast } from '@/hooks/use-toast'

// Query keys para organizar el cache
export const tenantKeys = {
  all: ['tenants'] as const,
  current: () => [...tenantKeys.all, 'current'] as const,
  details: () => [...tenantKeys.all, 'detail'] as const,
  detail: (id: string) => [...tenantKeys.details(), id] as const,
}

/**
 * Get current tenant
 */
export const useCurrentTenant = () => {
  return useQuery({
    queryKey: tenantKeys.current(),
    queryFn: tenantsService.getCurrent,
  })
}

/**
 * Check subdomain availability
 */
export const useCheckSubdomain = (
  params: { subdomain: string },
  options?: any
) => {
  return useQuery({
    queryKey: [...tenantKeys.all, 'check-subdomain', params.subdomain],
    queryFn: () => tenantsService.checkSubdomain(params.subdomain),
    enabled: params.subdomain.length > 0 && (options?.enabled ?? true),
    ...options,
  })
}

/**
 * Create tenant mutation
 */
export const useCreateTenant = (options?: any) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: any) => tenantsService.create(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: tenantKeys.all })
      if (options?.onSuccess) {
        options.onSuccess(data)
      } else {
        toast({
          title: 'Organización creada',
          description: 'La organización ha sido creada exitosamente',
          variant: 'success',
        })
      }
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo crear la organización',
        variant: 'destructive',
      })
    },
  })
}

/**
 * Update tenant mutation
 */
export const useUpdateTenant = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      tenantsService.update(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: tenantKeys.all })
      queryClient.invalidateQueries({
        queryKey: tenantKeys.detail(variables.id),
      })
      toast({
        title: 'Organización actualizada',
        description: 'La organización ha sido actualizada exitosamente',
        variant: 'success',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo actualizar la organización',
        variant: 'destructive',
      })
    },
  })
}

/**
 * Delete tenant mutation
 */
export const useDeleteTenant = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => tenantsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tenantKeys.all })
      toast({
        title: 'Organización eliminada',
        description: 'La organización ha sido eliminada exitosamente',
        variant: 'success',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo eliminar la organización',
        variant: 'destructive',
      })
    },
  })
}
