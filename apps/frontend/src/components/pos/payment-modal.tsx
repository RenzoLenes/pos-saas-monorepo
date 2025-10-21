"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { usePOSStore, usePOSSelectors, usePOSActions } from '@/store/pos-store'
import { useOfflineStatus } from '@/components/pos/offline-indicator'
import { useCompleteSale } from '@/hooks/api/use-sales'
import { formatCurrency } from '@/lib/utils'
import { toast } from '@/hooks/use-toast'
import type { CartDTO, CustomerDTO, SaleDTO } from 'shared-types'
import {
  CreditCard,
  DollarSign,
  Calculator,
  Receipt,
  Check,
  X,
  User,
  ArrowRight,
  Banknote,
  Coins
} from 'lucide-react'

interface PaymentModalProps {
  open: boolean
  onClose: () => void
}

type PaymentMethod = 'cash' | 'card' | 'mixed'

type SaleResult = SaleDTO

interface PaymentFormProps {
  activeCart: CartDTO | any  // Accept any cart type from the store
  cartTotal: number
  paymentMethod: PaymentMethod
  setPaymentMethod: (method: PaymentMethod) => void
  cashAmount: string
  setCashAmount: (amount: string) => void
  cardAmount: string
  setCardAmount: (amount: string) => void
  totalReceived: number
  change: number
  remainingAmount: number
  quickAmounts: number[]
  onQuickAmount: (amount: number) => void
  canProcessPayment: boolean
  isProcessing: boolean
  onProcessPayment: () => void
  onClose: () => void
  currentCustomer: CustomerDTO | null
  isOnline: boolean
}

interface ReceiptViewProps {
  saleResult: SaleResult
  cartTotal: number
  paymentMethod: PaymentMethod
  cashReceived: number
  cardAmount: number
  change: number
  customer: CustomerDTO | null
  onClose: () => void
}

export function PaymentModal({ open, onClose }: PaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash')
  const [cashAmount, setCashAmount] = useState('')
  const [cardAmount, setCardAmount] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [showReceipt, setShowReceipt] = useState(false)
  const [saleResult, setSaleResult] = useState<SaleResult | null>(null)
  
  const activeCart = usePOSSelectors.useActiveCart()
  const { currentCustomer } = usePOSStore()
  const { isOnline } = useOfflineStatus()
  const { closePayment } = usePOSActions()

  const completeSale = useCompleteSale()

  const cartTotal = Number(activeCart?.total) || 0
  const cashAmountNum = parseFloat(cashAmount) || 0
  const cardAmountNum = parseFloat(cardAmount) || 0
  const totalReceived = cashAmountNum + cardAmountNum
  const change = Math.max(0, totalReceived - cartTotal)
  const remainingAmount = Math.max(0, cartTotal - totalReceived)

  // Reset form when modal opens/closes
  useEffect(() => {
    if (open) {
      setPaymentMethod('cash')
      setCashAmount('')
      setCardAmount('')
      setShowReceipt(false)
      setSaleResult(null)
      setIsProcessing(false)
    }
  }, [open])

  // Auto-fill amounts based on payment method
  useEffect(() => {
    if (paymentMethod === 'cash') {
      setCardAmount('')
    } else if (paymentMethod === 'card') {
      setCashAmount('')
      setCardAmount(cartTotal.toString())
    }
  }, [paymentMethod, cartTotal])

  const handleQuickAmount = (amount: number) => {
    if (paymentMethod === 'cash' || paymentMethod === 'mixed') {
      setCashAmount(amount.toString())
    }
  }

  const quickAmounts = [10, 20, 50, 100, 200, 500]

  const canProcessPayment = () => {
    if (!activeCart || activeCart.items.length === 0) return false
    
    switch (paymentMethod) {
      case 'cash':
        return cashAmountNum >= cartTotal
      case 'card':
        return cardAmountNum >= cartTotal
      case 'mixed':
        return totalReceived >= cartTotal
      default:
        return false
    }
  }

  const handleProcessPayment = async () => {
    if (!activeCart || !canProcessPayment()) return

    setIsProcessing(true)

    try {
      const saleData: {
        cartId: string
        paymentMethod: PaymentMethod
        customerId?: string
        cashReceived?: number
        cardAmount?: number
      } = {
        cartId: activeCart.id,
        paymentMethod,
        customerId: currentCustomer?.id
      }

      if (paymentMethod === 'cash') {
        saleData.cashReceived = cashAmountNum
      } else if (paymentMethod === 'card') {
        saleData.cardAmount = cardAmountNum
      } else if (paymentMethod === 'mixed') {
        saleData.cashReceived = cashAmountNum
        saleData.cardAmount = cardAmountNum
      }

      const result = await completeSale.mutateAsync(saleData)
      
      setSaleResult(result)
      setShowReceipt(true)
      
      toast({
        title: "Venta completada",
        description: `Venta por ${formatCurrency(cartTotal)} procesada exitosamente`,
        variant: "default"
      })
      
    } catch (error) {
      console.error('Payment failed:', error)
      toast({
        title: "Error en el pago",
        description: "No se pudo procesar el pago. Intenta nuevamente.",
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleClose = () => {
    setShowReceipt(false)
    setSaleResult(null)
    closePayment()
    onClose()
  }

  if (!activeCart) return null

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Receipt className="h-5 w-5 mr-2" />
            Procesar Pago
          </DialogTitle>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {showReceipt && saleResult ? (
            <ReceiptView
              key="receipt"
              saleResult={saleResult}
              cartTotal={cartTotal}
              paymentMethod={paymentMethod}
              cashReceived={cashAmountNum}
              cardAmount={cardAmountNum}
              change={change}
              customer={currentCustomer}
              onClose={handleClose}
            />
          ) : (
            <PaymentForm
              key="payment"
              activeCart={activeCart}
              cartTotal={cartTotal}
              paymentMethod={paymentMethod}
              setPaymentMethod={setPaymentMethod}
              cashAmount={cashAmount}
              setCashAmount={setCashAmount}
              cardAmount={cardAmount}
              setCardAmount={setCardAmount}
              totalReceived={totalReceived}
              change={change}
              remainingAmount={remainingAmount}
              quickAmounts={quickAmounts}
              onQuickAmount={handleQuickAmount}
              canProcessPayment={canProcessPayment()}
              isProcessing={isProcessing}
              onProcessPayment={handleProcessPayment}
              onClose={handleClose}
              currentCustomer={currentCustomer}
              isOnline={isOnline}
            />
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}

function PaymentForm({
  activeCart,
  cartTotal,
  paymentMethod,
  setPaymentMethod,
  cashAmount,
  setCashAmount,
  cardAmount,
  setCardAmount,
  totalReceived,
  change,
  remainingAmount,
  quickAmounts,
  onQuickAmount,
  canProcessPayment,
  isProcessing,
  onProcessPayment,
  onClose,
  currentCustomer,
  isOnline
}: PaymentFormProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* Cart Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center justify-between">
            Resumen de Venta
            {currentCustomer && (
              <Badge variant="secondary" className="flex items-center">
                <User className="h-3 w-3 mr-1" />
                {currentCustomer.firstName} {currentCustomer.lastName}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Items: {activeCart.items.length}</span>
              <span>Subtotal: {formatCurrency(Number(activeCart.subtotal))}</span>
            </div>
            {Number(activeCart.discount) > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Descuento ({Number(activeCart.discount)}%):</span>
                <span>-{formatCurrency((Number(activeCart.subtotal) * Number(activeCart.discount)) / 100)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg border-t pt-2">
              <span>Total:</span>
              <span>{formatCurrency(cartTotal)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Method Selection */}
      <div className="space-y-4">
        <Label className="text-base font-medium">Método de Pago</Label>
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: 'cash', icon: DollarSign, label: 'Efectivo' },
            { value: 'card', icon: CreditCard, label: 'Tarjeta' },
            { value: 'mixed', icon: Calculator, label: 'Mixto' }
          ].map(({ value, icon: Icon, label }) => (
            <Button
              key={value}
              variant={paymentMethod === value ? "default" : "outline"}
              onClick={() => setPaymentMethod(value as PaymentMethod)}
              className="h-16 flex flex-col items-center space-y-2"
              disabled={!isOnline && value === 'card'}
            >
              <Icon className="h-5 w-5" />
              <span className="text-sm">{label}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Payment Inputs */}
      <div className="space-y-4">
        {(paymentMethod === 'cash' || paymentMethod === 'mixed') && (
          <div className="space-y-3">
            <Label htmlFor="cash">Efectivo Recibido</Label>
            <Input
              id="cash"
              type="number"
              step="0.01"
              value={cashAmount}
              onChange={(e) => setCashAmount(e.target.value)}
              placeholder="0.00"
              className="text-lg"
            />
            
            {/* Quick Amount Buttons */}
            <div className="grid grid-cols-6 gap-2">
              {quickAmounts.map((amount: number) => (
                <Button
                  key={amount}
                  variant="outline"
                  size="sm"
                  onClick={() => onQuickAmount(amount)}
                  className="text-xs"
                >
                  ${amount}
                </Button>
              ))}
            </div>
          </div>
        )}

        {(paymentMethod === 'card' || paymentMethod === 'mixed') && (
          <div className="space-y-3">
            <Label htmlFor="card">Monto con Tarjeta</Label>
            <Input
              id="card"
              type="number"
              step="0.01"
              value={cardAmount}
              onChange={(e) => setCardAmount(e.target.value)}
              placeholder="0.00"
              className="text-lg"
              disabled={!isOnline}
            />
            {!isOnline && (
              <p className="text-xs text-orange-600">
                Los pagos con tarjeta requieren conexión a internet
              </p>
            )}
          </div>
        )}
      </div>

      {/* Payment Summary */}
      <Card className="bg-gray-50">
        <CardContent className="pt-4">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Total a pagar:</span>
              <span className="font-medium">{formatCurrency(cartTotal)}</span>
            </div>
            
            {paymentMethod !== 'card' && (
              <div className="flex justify-between">
                <span>Efectivo recibido:</span>
                <span>{formatCurrency(parseFloat(cashAmount) || 0)}</span>
              </div>
            )}
            
            {(paymentMethod === 'card' || paymentMethod === 'mixed') && (
              <div className="flex justify-between">
                <span>Pago con tarjeta:</span>
                <span>{formatCurrency(parseFloat(cardAmount) || 0)}</span>
              </div>
            )}
            
            {paymentMethod === 'mixed' && (
              <div className="flex justify-between">
                <span>Total recibido:</span>
                <span className="font-medium">{formatCurrency(totalReceived)}</span>
              </div>
            )}
            
            {change > 0 && (
              <div className="flex justify-between text-green-600 font-medium">
                <span>Cambio:</span>
                <span>{formatCurrency(change)}</span>
              </div>
            )}
            
            {remainingAmount > 0 && (
              <div className="flex justify-between text-red-600 font-medium">
                <span>Faltante:</span>
                <span>{formatCurrency(remainingAmount)}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex space-x-3">
        <Button variant="outline" onClick={onClose} className="flex-1">
          Cancelar
        </Button>
        <Button 
          onClick={onProcessPayment} 
          disabled={!canProcessPayment || isProcessing}
          className="flex-1"
        >
          {isProcessing ? (
            <>
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="mr-2"
              >
                ⭐
              </motion.div>
              Procesando...
            </>
          ) : (
            <>
              <Check className="h-4 w-4 mr-2" />
              Procesar Pago
            </>
          )}
        </Button>
      </div>
    </motion.div>
  )
}

function ReceiptView({
  saleResult,
  cartTotal,
  paymentMethod,
  cashReceived,
  cardAmount,
  change,
  customer,
  onClose
}: ReceiptViewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="space-y-6 text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring" }}
        className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center"
      >
        <Check className="h-8 w-8 text-green-600" />
      </motion.div>
      
      <div>
        <h3 className="text-xl font-bold text-green-600 mb-2">
          ¡Venta Completada!
        </h3>
        <p className="text-gray-600">
          La transacción se ha procesado exitosamente
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recibo de Venta</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Total:</span>
            <span className="font-medium">{formatCurrency(cartTotal)}</span>
          </div>
          
          {paymentMethod === 'cash' && (
            <>
              <div className="flex justify-between">
                <span>Efectivo recibido:</span>
                <span>{formatCurrency(cashReceived)}</span>
              </div>
              {change > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Cambio:</span>
                  <span className="font-medium">{formatCurrency(change)}</span>
                </div>
              )}
            </>
          )}

          {paymentMethod === 'card' && (
            <div className="flex justify-between">
              <span>Pago con tarjeta:</span>
              <span>{formatCurrency(cardAmount)}</span>
            </div>
          )}

          {paymentMethod === 'mixed' && (
            <>
              <div className="flex justify-between">
                <span>Efectivo:</span>
                <span>{formatCurrency(cashReceived)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tarjeta:</span>
                <span>{formatCurrency(cardAmount)}</span>
              </div>
              {change > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Cambio:</span>
                  <span className="font-medium">{formatCurrency(change)}</span>
                </div>
              )}
            </>
          )}
          
          {customer && (
            <div className="flex justify-between border-t pt-2">
              <span>Cliente:</span>
              <span>{customer.firstName} {customer.lastName}</span>
            </div>
          )}
          
          <div className="flex justify-between border-t pt-2">
            <span>ID Venta:</span>
            <span className="font-mono text-xs">{saleResult?.id?.slice(-8)}</span>
          </div>
        </CardContent>
      </Card>

      <div className="flex space-x-3">
        <Button variant="outline" className="flex-1">
          <Receipt className="h-4 w-4 mr-2" />
          Imprimir Recibo
        </Button>
        <Button onClick={onClose} className="flex-1">
          <ArrowRight className="h-4 w-4 mr-2" />
          Continuar
        </Button>
      </div>
    </motion.div>
  )
}