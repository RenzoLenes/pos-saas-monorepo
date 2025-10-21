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
import { useApplyDiscount } from '@/hooks/api/use-cart'
import { Loader2, Percent } from 'lucide-react'

// Validation schema
const discountFormSchema = z.object({
  discount: z
    .number({
      required_error: 'El descuento es requerido',
      invalid_type_error: 'El descuento debe ser un número',
    })
    .min(0, 'El descuento debe ser mayor o igual a 0')
    .max(100, 'El descuento no puede exceder 100%'),
})

export type DiscountFormValues = z.infer<typeof discountFormSchema>

interface DiscountFormProps {
  cartId: string
  currentDiscount?: number
  userRole: 'admin' | 'manager' | 'cashier'
  onSuccess?: () => void
}

export function DiscountForm({
  cartId,
  currentDiscount = 0,
  userRole,
  onSuccess,
}: DiscountFormProps) {
  // Max discount by role
  const maxDiscount = userRole === 'admin' ? 100 : userRole === 'manager' ? 50 : 10

  const form = useForm<DiscountFormValues>({
    resolver: zodResolver(discountFormSchema.refine(
      (data) => data.discount <= maxDiscount,
      {
        message: `Tu rol solo permite descuentos de hasta ${maxDiscount}%`,
        path: ['discount'],
      }
    )),
    defaultValues: {
      discount: currentDiscount,
    },
  })

  const applyDiscount = useApplyDiscount()

  const onSubmit = async (data: DiscountFormValues) => {
    try {
      await applyDiscount.mutateAsync({
        cartId,
        discount: data.discount,
      })
      onSuccess?.()
    } catch (error) {
      // Error handling is done in the hook
    }
  }

  const isLoading = applyDiscount.isPending

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="discount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descuento (%)</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    max={maxDiscount}
                    placeholder="0"
                    disabled={isLoading}
                    className="pr-10"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                  <Percent className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
              </FormControl>
              <FormDescription>
                Máximo permitido para tu rol: {maxDiscount}%
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Aplicar Descuento
        </Button>
      </form>
    </Form>
  )
}
