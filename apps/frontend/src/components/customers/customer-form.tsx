'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useQueryClient } from '@tanstack/react-query'
import { useCreateCustomer, useUpdateCustomer, customerKeys } from '@/hooks/api/use-customers'
import { useToast } from '@/hooks/use-toast'
import { Loader2 } from 'lucide-react'
import { z } from 'zod';

// Validation schema
const customerFormSchema = z.object({
  firstName: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede exceder 50 caracteres'),
  lastName: z
    .string()
    .min(2, 'El apellido debe tener al menos 2 caracteres')
    .max(50, 'El apellido no puede exceder 50 caracteres'),
  email: z
    .string()
    .email('Email inválido')
    .optional()
    .or(z.literal('')),
  phone: z
    .string()
    .min(7, 'El teléfono debe tener al menos 7 dígitos')
    .max(20, 'El teléfono no puede exceder 20 caracteres')
    .optional()
    .or(z.literal('')),
  address: z
    .string()
    .max(200, 'La dirección no puede exceder 200 caracteres')
    .optional()
    .or(z.literal('')),
})

export type CustomerFormValues = z.infer<typeof customerFormSchema>

interface CustomerFormProps {
  defaultValues?: Partial<CustomerFormValues>
  customerId?: string
  onSuccess?: () => void
  onCancel?: () => void
}

export function CustomerForm({
  defaultValues,
  customerId,
  onSuccess,
  onCancel,
}: CustomerFormProps) {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      firstName: defaultValues?.firstName || '',
      lastName: defaultValues?.lastName || '',
      email: defaultValues?.email || '',
      phone: defaultValues?.phone || '',
      address: defaultValues?.address || '',
    },
  })

  const createCustomer = useCreateCustomer()
  const updateCustomer = useUpdateCustomer()

  const onSubmit = async (data: CustomerFormValues) => {
    try {
      if (customerId) {
        await updateCustomer.mutateAsync({
          id: customerId,
          data,
        })
      } else {
        await createCustomer.mutateAsync(data)
        form.reset()
      }
      onSuccess?.()
    } catch (error) {
      // Error handling is done in the hooks
    }
  }

  const isLoading = createCustomer.isPending || updateCustomer.isPending

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Nombre <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Juan"
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Apellido <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Pérez"
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="juan.perez@example.com"
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Teléfono</FormLabel>
                <FormControl>
                  <Input
                    type="tel"
                    placeholder="+1234567890"
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dirección</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Calle Principal 123, Ciudad"
                  disabled={isLoading}
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2 pt-4">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancelar
            </Button>
          )}
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {customerId ? 'Actualizar' : 'Crear'} Cliente
          </Button>
        </div>
      </form>
    </Form>
  )
}
