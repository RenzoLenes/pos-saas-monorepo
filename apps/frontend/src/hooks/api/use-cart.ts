import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { cartService } from '@/services/cart.service'
import { toast } from '@/hooks/use-toast'

// Query keys para organizar el cache
export const cartKeys = {
  all: ['carts'] as const,
  lists: () => [...cartKeys.all, 'list'] as const,
  list: (outletId?: string) => [...cartKeys.lists(), outletId] as const,
  details: () => [...cartKeys.all, 'detail'] as const,
  detail: (id: string) => [...cartKeys.details(), id] as const,
}

/**
 * Get all carts for current user
 */
export const useCarts = (outletId: string) => {
  return useQuery({
    queryKey: cartKeys.list(outletId),
    queryFn: () => cartService.getMyCarts(outletId),
    enabled: !!outletId,
  })
}

/**
 * Get cart by ID
 */
export const useCart = (id: string) => {
  return useQuery({
    queryKey: cartKeys.detail(id),
    queryFn: () => cartService.getById(id),
    enabled: !!id,
  })
}

/**
 * Create cart mutation
 */
export const useCreateCart = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: any) => cartService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.lists() })
      toast({
        title: 'Carrito creado',
        description: 'Se ha creado un nuevo carrito',
        variant: 'success',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo crear el carrito',
        variant: 'destructive',
      })
    },
  })
}

/**
 * Add item to cart mutation
 */
export const useAddItemToCart = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ cartId, data }: { cartId: string; data: any }) =>
      cartService.addItem(cartId, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: cartKeys.lists() })
      queryClient.invalidateQueries({
        queryKey: cartKeys.detail(variables.cartId),
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo agregar el producto',
        variant: 'destructive',
      })
    },
  })
}

/**
 * Alias for useAddItemToCart (backward compatibility)
 */
export const useAddToCart = useAddItemToCart

/**
 * Update cart item mutation
 */
export const useUpdateCartItem = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      cartId,
      itemId,
      data,
    }: {
      cartId: string
      itemId: string
      data: any
    }) => cartService.updateItem(cartId, itemId, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: cartKeys.lists() })
      queryClient.invalidateQueries({
        queryKey: cartKeys.detail(variables.cartId),
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo actualizar el item',
        variant: 'destructive',
      })
    },
  })
}

/**
 * Remove item from cart mutation
 */
export const useRemoveCartItem = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ cartId, itemId }: { cartId: string; itemId: string }) =>
      cartService.removeItem(cartId, itemId),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: cartKeys.lists() })
      queryClient.invalidateQueries({
        queryKey: cartKeys.detail(variables.cartId),
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo eliminar el item',
        variant: 'destructive',
      })
    },
  })
}

/**
 * Apply discount to cart mutation
 */
export const useApplyDiscount = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ cartId, discount }: { cartId: string; discount: number }) =>
      cartService.applyDiscount(cartId, discount),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: cartKeys.lists() })
      queryClient.invalidateQueries({
        queryKey: cartKeys.detail(variables.cartId),
      })
      toast({
        title: 'Descuento aplicado',
        description: 'El descuento ha sido aplicado al carrito',
        variant: 'success',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo aplicar el descuento',
        variant: 'destructive',
      })
    },
  })
}

/**
 * Hold cart mutation
 */
export const useHoldCart = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ cartId, name }: { cartId: string; name: string }) =>
      cartService.hold(cartId, name),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: cartKeys.lists() })
      queryClient.invalidateQueries({
        queryKey: cartKeys.detail(variables.cartId),
      })
      toast({
        title: 'Carrito en espera',
        description: 'El carrito ha sido puesto en espera',
        variant: 'success',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo poner el carrito en espera',
        variant: 'destructive',
      })
    },
  })
}

/**
 * Activate held cart mutation
 */
export const useActivateCart = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (cartId: string) => cartService.activate(cartId),
    onSuccess: (data, cartId) => {
      queryClient.invalidateQueries({ queryKey: cartKeys.lists() })
      queryClient.invalidateQueries({ queryKey: cartKeys.detail(cartId) })
      toast({
        title: 'Carrito activado',
        description: 'El carrito ha sido reactivado',
        variant: 'success',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo activar el carrito',
        variant: 'destructive',
      })
    },
  })
}

/**
 * Delete cart mutation
 */
export const useDeleteCart = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (cartId: string) => cartService.delete(cartId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.lists() })
      toast({
        title: 'Carrito eliminado',
        description: 'El carrito ha sido eliminado',
        variant: 'success',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo eliminar el carrito',
        variant: 'destructive',
      })
    },
  })
}

/**
 * Assign customer to cart mutation
 */
export const useAssignCustomer = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      cartId,
      customerId,
    }: {
      cartId: string
      customerId: string | null
    }) => cartService.assignCustomer(cartId, customerId),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: cartKeys.lists() })
      queryClient.invalidateQueries({
        queryKey: cartKeys.detail(variables.cartId),
      })
      toast({
        title: 'Cliente asignado',
        description: 'El cliente ha sido asignado al carrito',
        variant: 'success',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo asignar el cliente',
        variant: 'destructive',
      })
    },
  })
}

/**
 * Clear cart items mutation
 */
export const useClearCart = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (cartId: string) => cartService.clear(cartId),
    onSuccess: (data, cartId) => {
      queryClient.invalidateQueries({ queryKey: cartKeys.lists() })
      queryClient.invalidateQueries({ queryKey: cartKeys.detail(cartId) })
      toast({
        title: 'Carrito vaciado',
        description: 'Todos los items han sido removidos del carrito',
        variant: 'success',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo vaciar el carrito',
        variant: 'destructive',
      })
    },
  })
}
