'use client'

import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { shallow } from 'zustand/shallow'
import type { CartDTO, CustomerDTO, ProductDTO } from 'shared-types'

// Extended types for cart with items
interface CartItemWithProduct {
  id: string
  cartId: string
  productId: string
  quantity: number
  price: number
  discount: number
  subtotal: number
  product: ProductDTO
  createdAt: Date
  updatedAt: Date
}

interface CartWithItems extends Omit<CartDTO, 'items'> {
  items: CartItemWithProduct[]
}

interface POSState {
  // Current session
  selectedTenantId: string
  selectedOutletId: string
  activeCartId: string
  isOnline: boolean
  syncInProgress: boolean
  pendingOperations: number

  // Data
  carts: CartWithItems[]
  customers: CustomerDTO[]
  currentCustomer: CustomerDTO | null

  // UI State
  showPaymentModal: boolean
  showCustomerModal: boolean
  showBarcode: boolean
  isLoading: boolean
  error: string | null

  // Actions
  setSelectedTenantId: (tenantId: string) => void
  setSelectedOutletId: (outletId: string) => void
  setActiveCartId: (cartId: string) => void
  setIsOnline: (online: boolean) => void
  setSyncInProgress: (inProgress: boolean) => void
  setPendingOperations: (count: number) => void

  // Cart actions
  setCarts: (carts: CartWithItems[]) => void
  addCart: (cart: CartWithItems) => void
  updateCart: (cartId: string, updates: Partial<CartWithItems>) => void
  removeCart: (cartId: string) => void

  // Cart item actions
  addItemToCart: (cartId: string, item: CartItemWithProduct) => void
  updateCartItem: (
    cartId: string,
    itemId: string,
    updates: Partial<CartItemWithProduct>
  ) => void
  removeCartItem: (cartId: string, itemId: string) => void

  // Customer actions
  setCustomers: (customers: CustomerDTO[]) => void
  setCurrentCustomer: (customer: CustomerDTO | null) => void
  addCustomer: (customer: CustomerDTO) => void

  // UI actions
  setShowPaymentModal: (show: boolean) => void
  setShowCustomerModal: (show: boolean) => void
  setShowBarcode: (show: boolean) => void
  setIsLoading: (loading: boolean) => void
  setError: (error: string | null) => void

  // Computed values
  getActiveCart: () => CartWithItems | undefined
  getCartTotal: (cartId: string) => number
  getCartItemCount: (cartId: string) => number
  hasUnsavedChanges: () => boolean

  // Reset
  resetState: () => void
}

const initialState = {
  selectedTenantId: '',
  selectedOutletId: '',
  activeCartId: '',
  isOnline: true,
  syncInProgress: false,
  pendingOperations: 0,
  carts: [],
  customers: [],
  currentCustomer: null,
  showPaymentModal: false,
  showCustomerModal: false,
  showBarcode: false,
  isLoading: false,
  error: null,
}

export const usePOSStore = create<POSState>()(
  subscribeWithSelector((set, get) => ({
    ...initialState,

    // Basic setters
    setSelectedTenantId: (tenantId) => set({ selectedTenantId: tenantId }),
    setSelectedOutletId: (outletId) => set({ selectedOutletId: outletId }),
    setActiveCartId: (cartId) => set({ activeCartId: cartId }),
    setIsOnline: (online) => set({ isOnline: online }),
    setSyncInProgress: (inProgress) => set({ syncInProgress: inProgress }),
    setPendingOperations: (count) => set({ pendingOperations: count }),

    // Cart management
    setCarts: (carts) => set({ carts }),
    addCart: (cart) =>
      set((state) => ({
        carts: [cart, ...state.carts],
      })),
    updateCart: (cartId, updates) =>
      set((state) => ({
        carts: state.carts.map((cart) =>
          cart.id === cartId ? { ...cart, ...updates } : cart
        ),
      })),
    removeCart: (cartId) =>
      set((state) => ({
        carts: state.carts.filter((cart) => cart.id !== cartId),
        activeCartId: state.activeCartId === cartId ? '' : state.activeCartId,
      })),

    // Cart item management
    addItemToCart: (cartId, item) =>
      set((state) => ({
        carts: state.carts.map((cart) =>
          cart.id === cartId ? { ...cart, items: [...cart.items, item] } : cart
        ),
      })),
    updateCartItem: (cartId, itemId, updates) =>
      set((state) => ({
        carts: state.carts.map((cart) =>
          cart.id === cartId
            ? {
                ...cart,
                items: cart.items.map((item) =>
                  item.id === itemId ? { ...item, ...updates } : item
                ),
              }
            : cart
        ),
      })),
    removeCartItem: (cartId, itemId) =>
      set((state) => ({
        carts: state.carts.map((cart) =>
          cart.id === cartId
            ? {
                ...cart,
                items: cart.items.filter((item) => item.id !== itemId),
              }
            : cart
        ),
      })),

    // Customer management
    setCustomers: (customers) => set({ customers }),
    setCurrentCustomer: (customer) => set({ currentCustomer: customer }),
    addCustomer: (customer) =>
      set((state) => ({
        customers: [customer, ...state.customers],
      })),

    // UI state
    setShowPaymentModal: (show) => set({ showPaymentModal: show }),
    setShowCustomerModal: (show) => set({ showCustomerModal: show }),
    setShowBarcode: (show) => set({ showBarcode: show }),
    setIsLoading: (loading) => set({ isLoading: loading }),
    setError: (error) => set({ error }),

    // Computed values
    getActiveCart: () => {
      const state = get()
      return state.carts.find((cart) => cart.id === state.activeCartId)
    },
    getCartTotal: (cartId) => {
      const state = get()
      const cart = state.carts.find((c) => c.id === cartId)
      return Number(cart?.total) || 0
    },
    getCartItemCount: (cartId) => {
      const state = get()
      const cart = state.carts.find((c) => c.id === cartId)
      return cart?.items.reduce((sum, item) => sum + item.quantity, 0) || 0
    },
    hasUnsavedChanges: () => {
      const state = get()
      return state.pendingOperations > 0 || state.syncInProgress
    },

    // Reset
    resetState: () => set(initialState),
  }))
)

// Selectors for better performance
export const usePOSSelectors = {
  // Basic selectors
  useSelectedTenant: () => usePOSStore((state) => state.selectedTenantId),
  useSelectedOutlet: () => usePOSStore((state) => state.selectedOutletId),
  useActiveCart: () => usePOSStore((state) => state.getActiveCart()),
  useIsOnline: () => usePOSStore((state) => state.isOnline),
  useSyncStatus: (): { syncInProgress: boolean; pendingOperations: number } =>
    usePOSStore(
      (state) => ({
        syncInProgress: state.syncInProgress,
        pendingOperations: state.pendingOperations,
      })
    ),

  // Cart selectors
  useActiveCarts: (): CartWithItems[] =>
    usePOSStore(
      (state) => state.carts.filter((cart) => cart.status === 'active')
    ),
  useHeldCarts: (): CartWithItems[] =>
    usePOSStore(
      (state) => state.carts.filter((cart) => cart.status === 'hold')
    ),

  // UI selectors
  useModalsState: (): { showPaymentModal: boolean; showCustomerModal: boolean; showBarcode: boolean } =>
    usePOSStore(
      (state) => ({
        showPaymentModal: state.showPaymentModal,
        showCustomerModal: state.showCustomerModal,
        showBarcode: state.showBarcode,
      })
    ),

  // Loading state
  useLoadingState: (): { isLoading: boolean; error: string | null } =>
    usePOSStore(
      (state) => ({
        isLoading: state.isLoading,
        error: state.error,
      })
    ),

  // Current customer
  useCurrentCustomer: () => usePOSStore((state) => state.currentCustomer),
}

// Actions
export const usePOSActions = () => ({
  // Tenant, outlet and cart selection
  selectTenant: usePOSStore((state) => state.setSelectedTenantId),
  selectOutlet: usePOSStore((state) => state.setSelectedOutletId),
  selectCart: usePOSStore((state) => state.setActiveCartId),

  // Cart management
  addCart: usePOSStore((state) => state.addCart),
  updateCart: usePOSStore((state) => state.updateCart),
  removeCart: usePOSStore((state) => state.removeCart),

  // Cart items
  addItem: usePOSStore((state) => state.addItemToCart),
  updateItem: usePOSStore((state) => state.updateCartItem),
  removeItem: usePOSStore((state) => state.removeCartItem),

  // Customer management
  setCustomer: usePOSStore((state) => state.setCurrentCustomer),

  // UI controls
  openPayment: () => usePOSStore.getState().setShowPaymentModal(true),
  closePayment: () => usePOSStore.getState().setShowPaymentModal(false),
  openCustomer: () => usePOSStore.getState().setShowCustomerModal(true),
  closeCustomer: () => usePOSStore.getState().setShowCustomerModal(false),
  openBarcode: () => usePOSStore.getState().setShowBarcode(true),
  closeBarcode: () => usePOSStore.getState().setShowBarcode(false),

  // Sync status
  setOnlineStatus: usePOSStore((state) => state.setIsOnline),
  setSyncInProgress: usePOSStore((state) => state.setSyncInProgress),
  setPendingOperations: usePOSStore((state) => state.setPendingOperations),

  // Error handling
  setError: usePOSStore((state) => state.setError),
  clearError: () => usePOSStore.getState().setError(null),

  // State management
  reset: usePOSStore((state) => state.resetState),
})
