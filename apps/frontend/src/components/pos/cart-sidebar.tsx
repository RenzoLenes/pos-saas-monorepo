'use client'

import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { formatCurrency } from '@/lib/utils'
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  Pause,
  Play,
  CreditCard,
  DollarSign,
  Percent,
  X
} from 'lucide-react'
import type { CartDTO } from 'shared-types'
import {
  useUpdateCartItem,
  useRemoveCartItem,
  useApplyDiscount,
  useHoldCart,
  useActivateCart,
  useDeleteCart,
  cartKeys
} from '@/hooks/api/use-cart'
import { useCompleteSale, saleKeys } from '@/hooks/api/use-sales'

interface CartSidebarProps {
  carts: CartDTO[]
  activeCartId: string
  onCartSelect: (cartId: string) => void
  outletId: string
  isOnline: boolean
}

export function CartSidebar({
  carts,
  activeCartId,
  onCartSelect,
  outletId,
  isOnline
}: CartSidebarProps) {
  const [discountInput, setDiscountInput] = useState('')
  const [cashReceived, setCashReceived] = useState('')
  const [showPayment, setShowPayment] = useState(false)
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const updateItemQuantity = useUpdateCartItem()
  const removeItem = useRemoveCartItem()
  const applyDiscount = useApplyDiscount()
  const holdCart = useHoldCart()
  const activateCart = useActivateCart()
  const completeSale = useCompleteSale()
  const deleteCart = useDeleteCart()

  const activeCart = carts.find(cart => cart.id === activeCartId)

  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    if (!activeCart) return

    if (newQuantity <= 0) {
      await removeItem.mutateAsync({ cartId: activeCart.id, itemId })
    } else {
      await updateItemQuantity.mutateAsync({
        cartId: activeCart.id,
        itemId,
        data: { quantity: newQuantity }
      })
    }
  }

  const handleApplyDiscount = async () => {
    if (!activeCart || !discountInput) return

    const discount = parseFloat(discountInput)
    if (discount < 0 || discount > 100) return

    await applyDiscount.mutateAsync({
      cartId: activeCart.id,
      discount,
    })

    setDiscountInput('')
  }

  const handleHoldCart = async () => {
    if (!activeCart) return

    await holdCart.mutateAsync({
      cartId: activeCart.id,
      name: `Held Cart ${new Date().toLocaleTimeString()}`,
    })
  }

  const handleActivateCart = async (cartId: string) => {
    await activateCart.mutateAsync(cartId)
    onCartSelect(cartId)
  }

  const handleDeleteCart = async (cartId: string) => {
    await deleteCart.mutateAsync(cartId)
    if (activeCartId === cartId) {
      onCartSelect('')
    }
  }

  const handleCompleteSale = async (paymentMethod: 'cash' | 'card') => {
    if (!activeCart) return

    // Validar que se haya seleccionado un cliente
    if (!activeCart.customerId) {
      toast({
        title: "Cliente requerido",
        description: "Debes seleccionar un cliente antes de cerrar la venta",
        variant: "destructive",
      })
      return
    }

    const saleData: {
      cartId: string
      paymentMethod: 'cash' | 'card'
      cashReceived?: number
    } = {
      cartId: activeCart.id,
      paymentMethod,
    }

    if (paymentMethod === 'cash') {
      const received = parseFloat(cashReceived)
      if (received < Number(activeCart.total)) {
        toast({
          title: "Efectivo insuficiente",
          description: "El monto recibido es menor al total de la venta",
          variant: "destructive",
        })
        return
      }
      saleData.cashReceived = received
    }

    try {
      await completeSale.mutateAsync(saleData)
      setCashReceived('')
      setShowPayment(false)
    } catch (error) {
      console.error('Sale failed:', error)
    }
  }

  const activeCarts = carts.filter(cart => cart.status === 'active')
  const heldCarts = carts.filter(cart => cart.status === 'hold')

  return (
    <div className="h-full flex flex-col">
      {/* Cart Tabs */}
      <div className="p-4 border-b">
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="active">
              Active ({activeCarts.length})
            </TabsTrigger>
            <TabsTrigger value="hold">
              Hold ({heldCarts.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-2 mt-4">
            {activeCarts.map((cart) => (
              <div key={cart.id} className="flex items-center space-x-2">
                <Button
                  variant={cart.id === activeCartId ? "default" : "outline"}
                  className="flex-1 justify-start"
                  onClick={() => onCartSelect(cart.id)}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  {cart.name || `Cart ${cart.id.slice(-4)}`}
                  <span className="ml-auto mr-2">
                    {formatCurrency(Number(cart.total))}
                  </span>
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteCart(cart.id)
                  }}
                  disabled={deleteCart.isPending}
                  className="h-10 w-10 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="hold" className="space-y-2 mt-4">
            {heldCarts.map((cart) => (
              <div key={cart.id} className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  className="flex-1 justify-start"
                  onClick={() => handleActivateCart(cart.id)}
                  disabled={activateCart.isPending}
                >
                  <Play className="h-4 w-4 mr-2" />
                  {cart.name || `Cart ${cart.id.slice(-4)}`}
                  <span className="ml-auto mr-2 text-sm font-medium">
                    {formatCurrency(Number(cart.total))}
                  </span>
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteCart(cart.id)
                  }}
                  disabled={deleteCart.isPending}
                  className="h-10 w-10 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-auto p-4">
        {activeCart ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">
                {activeCart.name || `Cart ${activeCart.id.slice(-4)}`}
              </h3>
              <Button
                size="sm"
                variant="outline"
                onClick={handleHoldCart}
                disabled={activeCart.items.length === 0 || holdCart.isPending}
              >
                <Pause className="h-4 w-4 mr-1" />
                Hold
              </Button>
            </div>

            {/* Items */}
            <div className="space-y-2">
              {activeCart.items.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-sm">
                          {item.productName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatCurrency(Number(item.unitPrice))} each
                        </p>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          disabled={updateItemQuantity.isPending || removeItem.isPending}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>

                        <span className="w-8 text-center text-sm">
                          {item.quantity}
                        </span>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          disabled={updateItemQuantity.isPending}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => activeCart && removeItem.mutateAsync({ cartId: activeCart.id, itemId: item.id })}
                          disabled={removeItem.isPending}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-gray-500">
                        {item.quantity} × {formatCurrency(Number(item.unitPrice))}
                      </span>
                      <span className="font-medium">
                        {formatCurrency(Number(item.totalPrice))}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Discount */}
            {isOnline && (
              <Card>
                <CardContent className="p-3">
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 flex items-center space-x-2">
                      <Percent className="h-4 w-4" />
                      <Input
                        placeholder="Discount %"
                        type="number"
                        value={discountInput}
                        onChange={(e) => setDiscountInput(e.target.value)}
                        max="100"
                        min="0"
                      />
                    </div>
                    <Button
                      size="sm"
                      onClick={handleApplyDiscount}
                      disabled={!discountInput || applyDiscount.isPending}
                    >
                      Apply
                    </Button>
                  </div>
                  {Number(activeCart.discount) > 0 && (
                    <div className="text-xs text-green-600 mt-1">
                      {Number(activeCart.discount)}% discount applied
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Totals */}
            <Card>
              <CardContent className="p-4 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(Number(activeCart.subtotal))}</span>
                </div>

                {Number(activeCart.discount) > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({Number(activeCart.discount)}%):</span>
                    <span>
                      -{formatCurrency((Number(activeCart.subtotal) * Number(activeCart.discount)) / 100)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span>{formatCurrency(Number(activeCart.total))}</span>
                </div>
              </CardContent>
            </Card>

            {/* Payment */}
            {!showPayment ? (
              <Button
                className="w-full"
                size="lg"
                onClick={() => setShowPayment(true)}
                disabled={activeCart.items.length === 0 || completeSale.isPending}
              >
                {completeSale.isPending ? 'Processing...' : 'Checkout'}
              </Button>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Payment</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      onClick={() => handleCompleteSale('card')}
                      disabled={completeSale.isPending}
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      Card
                    </Button>

                    <Button
                      onClick={() => handleCompleteSale('cash')}
                      disabled={completeSale.isPending || (parseFloat(cashReceived) < Number(activeCart.total))}
                    >
                      <DollarSign className="h-4 w-4 mr-2" />
                      Cash
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Input
                      placeholder="Cash received"
                      type="number"
                      step="0.01"
                      value={cashReceived}
                      onChange={(e) => setCashReceived(e.target.value)}
                    />

                    {parseFloat(cashReceived) > Number(activeCart.total) && (
                      <div className="text-sm">
                        Change: {formatCurrency(parseFloat(cashReceived) - Number(activeCart.total))}
                      </div>
                    )}
                  </div>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setShowPayment(false)}
                  >
                    Cancel
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <div className="text-center text-gray-500 mt-8">
            No active cart selected
          </div>
        )}
      </div>
    </div>
  )
}
