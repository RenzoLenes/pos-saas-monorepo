'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { motion } from 'framer-motion'
import { useOutlets } from '@/hooks/api/use-outlets'
import { useProducts } from '@/hooks/api/use-products'
import { useCarts, useCreateCart, useAssignCustomer } from '@/hooks/api/use-cart'
import { useOfflineSync } from '@/hooks/use-offline-sync'
import { usePOSStore, usePOSActions, usePOSSelectors } from '@/store/pos-store'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { ProductGrid } from '@/components/pos/product-grid'
import { CartSidebar } from '@/components/pos/cart-sidebar'
import { BarcodeScanner } from '@/components/pos/barcode-scanner'
import { CustomerModal } from '@/components/pos/customer-modal'
import { PaymentModal } from '@/components/pos/payment-modal'
import { OfflineIndicator } from '@/components/pos/offline-indicator'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/hooks/use-toast'
import { ShoppingCart, Scan, Users, Plus, Zap } from 'lucide-react'

export default function POSPage() {
  const { user } = useUser()
  const { isOnline, syncInProgress, pendingOperations } = useOfflineSync()
  
  // POS Store
  const {
    selectedOutletId,
    activeCartId,
    showBarcode,
    showCustomerModal,
    showPaymentModal,
    currentCustomer,
    carts
  } = usePOSStore()
  
  const {
    selectOutlet,
    selectCart,
    openBarcode,
    closeBarcode,
    openCustomer,
    closeCustomer,
    openPayment,
    closePayment,
    addCart,
    setCustomer
  } = usePOSActions()

  // Get user outlets
  const { data: outlets } = useOutlets()

  // Get products for selected outlet
  const { data: products } = useProducts({
    outletId: selectedOutletId
  })

  // Get active carts
  const { data: serverCarts, refetch: refetchCarts } = useCarts(selectedOutletId || '')

  // Create new cart mutation
  const createCart = useCreateCart()

  // Assign customer to cart mutation
  const assignCustomer = useAssignCustomer()

  const activeCart = carts.find(cart => cart.id === activeCartId) || 
                     serverCarts?.find(cart => cart.id === activeCartId)

  // Sync outlet selection
  useEffect(() => {
    if (outlets && outlets.length > 0 && !selectedOutletId) {
      selectOutlet(outlets[0].id)
    }
  }, [outlets, selectedOutletId, selectOutlet])

  // Auto-create cart if none exists, or prompt user to select if multiple exist
  useEffect(() => {
    if (selectedOutletId && serverCarts !== undefined) {
      if (serverCarts.length === 0 && !createCart.isPending) {
        // No carts exist, create one automatically
        console.log('No carts found, creating first cart automatically...')
        createCart.mutateAsync({
          outletId: selectedOutletId,
          name: 'Carrito 1',
        }).then((newCart) => {
          addCart({ ...newCart, items: [] } as any)
          selectCart(newCart.id)
          refetchCarts()
        })
      } else if (serverCarts.length > 0 && !activeCartId) {
        // Carts exist but none selected, show toast asking user to select
        console.log('Multiple carts available, user needs to select one')
        toast({
          title: "Selecciona un carrito",
          description: `Tienes ${serverCarts.length} carrito${serverCarts.length > 1 ? 's' : ''} disponible${serverCarts.length > 1 ? 's' : ''}. Por favor selecciona uno del panel derecho.`,
          variant: "default"
        })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverCarts, selectedOutletId, activeCartId])

  const handleCreateNewCart = async () => {
    if (!selectedOutletId) {
      toast({
        title: "Selecciona un outlet",
        description: "Necesitas seleccionar un outlet antes de crear un carrito",
        variant: "destructive"
      })
      return
    }

    try {
      const newCart = await createCart.mutateAsync({
        outletId: selectedOutletId,
        name: `Carrito ${(serverCarts?.length || 0) + 1}`,
      })
      addCart({ ...newCart, items: [] } as any)
      selectCart(newCart.id)
      refetchCarts()
    } catch (error) {
      // Error is handled in hook
    }
  }

  const handleProductScanned = (barcode: string) => {
    // This will be handled by the barcode scanner component
    console.log('Product scanned:', barcode)
    closeBarcode()
  }

  if (!user) {
    return (
      <DashboardLayout showOutletSelector={true}>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout showOutletSelector={true}>
      <div className="flex h-full">
        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white border-b p-4 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <OfflineIndicator variant="full" showSyncButton />
              </div>

              <div className="flex items-center space-x-3">
                {currentCustomer && (
                  <Badge variant="secondary" className="flex items-center">
                    <Users className="h-3 w-3 mr-1" />
                    {currentCustomer.firstName} {currentCustomer.lastName}
                  </Badge>
                )}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={openCustomer}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Cliente
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={openBarcode}
                >
                  <Scan className="h-4 w-4 mr-2" />
                  Escanear
                </Button>

                <Button
                  size="sm"
                  onClick={handleCreateNewCart}
                  disabled={!selectedOutletId || createCart.isPending}
                >
                  {createCart.isPending ? (
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="mr-2"
                    >
                      <Zap className="h-4 w-4" />
                    </motion.div>
                  ) : (
                    <Plus className="h-4 w-4 mr-2" />
                  )}
                  Nuevo Carrito
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Product Grid */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="flex-1 p-4 overflow-auto bg-gray-50"
          >
            {products ? (
              <ProductGrid
                products={products}
                activeCartId={activeCartId}
                outletId={selectedOutletId}
                isOnline={isOnline}
              />
            ) : (
              <div className="text-center py-12">
                <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {selectedOutletId ? 'Cargando productos...' : 'Selecciona un outlet'}
                </h3>
                <p className="text-gray-600">
                  {selectedOutletId 
                    ? 'Los productos se están cargando' 
                    : 'Elige un outlet del menú para comenzar'
                  }
                </p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Cart Sidebar */}
        <motion.div 
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="w-96 bg-white border-l shadow-lg"
        >
          <CartSidebar
            carts={serverCarts || []}
            activeCartId={activeCartId}
            onCartSelect={selectCart}
            outletId={selectedOutletId}
            isOnline={isOnline}
          />
        </motion.div>
      </div>

      {/* Modals */}
      <BarcodeScanner />

      <CustomerModal
        open={showCustomerModal}
        onClose={closeCustomer}
        onCustomerSelect={async (customer) => {
          setCustomer(customer)
          if (activeCartId) {
            try {
              await assignCustomer.mutateAsync({
                cartId: activeCartId,
                customerId: customer?.id || null,
              })
              refetchCarts()
            } catch (error) {
              // Error handled in hook
            }
          }
          closeCustomer()
        }}
      />

      <PaymentModal
        open={showPaymentModal}
        onClose={closePayment}
      />
    </DashboardLayout>
  )
}