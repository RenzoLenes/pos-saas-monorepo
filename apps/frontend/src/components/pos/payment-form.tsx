'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useCompleteSale } from '@/hooks/api/use-sales'
import { Loader2, CreditCard, DollarSign, Banknote } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

// Validation schema
const paymentFormSchema = z.object({
  paymentMethod: z.enum(['cash', 'card', 'mixed'], {
    required_error: 'Selecciona un método de pago',
  }),
  cashReceived: z
    .number({
      invalid_type_error: 'Ingresa un monto válido',
    })
    .min(0, 'El monto debe ser mayor a 0')
    .optional()
    .nullable(),
})

export type PaymentFormValues = z.infer<typeof paymentFormSchema>

interface PaymentFormProps {
  cartId: string
  total: number
  onSuccess?: () => void
  onCancel?: () => void
}

export function PaymentForm({
  cartId,
  total,
  onSuccess,
  onCancel,
}: PaymentFormProps) {
  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(
      paymentFormSchema.refine(
        (data) => {
          // Si es pago en efectivo, debe recibir al menos el total
          if (data.paymentMethod === 'cash') {
            return (data.cashReceived || 0) >= total
          }
          return true
        },
        {
          message: 'El efectivo recibido debe ser mayor o igual al total',
          path: ['cashReceived'],
        }
      )
    ),
    defaultValues: {
      paymentMethod: 'cash',
      cashReceived: null,
    },
  })

  const completeSale = useCompleteSale()

  const onSubmit = async (data: PaymentFormValues) => {
    try {
      await completeSale.mutateAsync({
        cartId,
        paymentMethod: data.paymentMethod,
        cashReceived: data.paymentMethod === 'cash' ? data.cashReceived! : undefined,
      })
      onSuccess?.()
    } catch (error) {
      // Error handling is done in the hook
    }
  }

  const isLoading = completeSale.isPending
  const paymentMethod = form.watch('paymentMethod')
  const cashReceived = form.watch('cashReceived')

  const change = paymentMethod === 'cash' && cashReceived
    ? Math.max(0, cashReceived - total)
    : 0

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Total Display */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-lg font-medium">Total a Pagar:</span>
            <span className="text-2xl font-bold text-blue-600">
              {formatCurrency(total)}
            </span>
          </div>
        </div>

        {/* Payment Method */}
        <FormField
          control={form.control}
          name="paymentMethod"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Método de Pago</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  value={field.value}
                  className="grid grid-cols-3 gap-4"
                >
                  <div>
                    <RadioGroupItem
                      value="cash"
                      id="cash"
                      className="peer sr-only"
                    />
                    <label
                      htmlFor="cash"
                      className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                    >
                      <DollarSign className="mb-2 h-6 w-6" />
                      <span className="text-sm font-medium">Efectivo</span>
                    </label>
                  </div>

                  <div>
                    <RadioGroupItem
                      value="card"
                      id="card"
                      className="peer sr-only"
                    />
                    <label
                      htmlFor="card"
                      className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                    >
                      <CreditCard className="mb-2 h-6 w-6" />
                      <span className="text-sm font-medium">Tarjeta</span>
                    </label>
                  </div>

                  <div>
                    <RadioGroupItem
                      value="mixed"
                      id="mixed"
                      className="peer sr-only"
                    />
                    <label
                      htmlFor="mixed"
                      className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                    >
                      <Banknote className="mb-2 h-6 w-6" />
                      <span className="text-sm font-medium">Mixto</span>
                    </label>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Cash Received Input (only for cash payment) */}
        {paymentMethod === 'cash' && (
          <FormField
            control={form.control}
            name="cashReceived"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Efectivo Recibido</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    min={total}
                    placeholder={total.toString()}
                    disabled={isLoading}
                    {...field}
                    value={field.value ?? ''}
                    onChange={(e) => {
                      const value = e.target.value
                      field.onChange(value === '' ? null : parseFloat(value))
                    }}
                  />
                </FormControl>
                <FormDescription>
                  Mínimo: {formatCurrency(total)}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Change Display */}
        {paymentMethod === 'cash' && cashReceived && cashReceived >= total && (
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-green-800">Cambio:</span>
              <span className="text-xl font-bold text-green-600">
                {formatCurrency(change)}
              </span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-2 pt-4">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1"
            >
              Cancelar
            </Button>
          )}
          <Button type="submit" disabled={isLoading} className="flex-1">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Completar Venta
          </Button>
        </div>
      </form>
    </Form>
  )
}
