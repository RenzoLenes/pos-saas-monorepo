import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { usersService } from '@/services/users.service'
import { toast } from '@/hooks/use-toast'

// Query keys para organizar el cache
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filters?: any) => [...userKeys.lists(), filters] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
  current: () => [...userKeys.all, 'current'] as const,
}

/**
 * Get all users
 */
export const useUsers = () => {
  return useQuery({
    queryKey: userKeys.lists(),
    queryFn: usersService.getAll,
  })
}

/**
 * Get user by ID
 */
export const useUser = (id: string) => {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => usersService.getById(id),
    enabled: !!id,
  })
}

/**
 * Get current authenticated user
 */
export const useCurrentUser = () => {
  return useQuery({
    queryKey: userKeys.current(),
    queryFn: usersService.getCurrent,
  })
}

/**
 * Update user mutation
 */
export const useUpdateUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      usersService.update(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() })
      queryClient.invalidateQueries({
        queryKey: userKeys.detail(variables.id),
      })
      queryClient.invalidateQueries({ queryKey: userKeys.current() })
      toast({
        title: 'Usuario actualizado',
        description: 'El usuario ha sido actualizado exitosamente',
        variant: 'success',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo actualizar el usuario',
        variant: 'destructive',
      })
    },
  })
}

/**
 * Delete user mutation
 */
export const useDeleteUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => usersService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() })
      toast({
        title: 'Usuario eliminado',
        description: 'El usuario ha sido eliminado exitosamente',
        variant: 'success',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo eliminar el usuario',
        variant: 'destructive',
      })
    },
  })
}
