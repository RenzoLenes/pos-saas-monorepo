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
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { useCreateProduct, useUpdateProduct } from '@/hooks/api/use-products'
import { Loader2 } from 'lucide-react'

// Validation schema
const productFormSchema = z.object({
  name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  description: z
    .string()
    .max(500, 'La descripción no puede exceder 500 caracteres')
    .optional()
    .or(z.literal('')),
  sku: z
    .string()
    .max(50, 'El SKU no puede exceder 50 caracteres')
    .optional()
    .or(z.literal('')),
  barcode: z
    .string()
    .max(50, 'El código de barras no puede exceder 50 caracteres')
    .optional()
    .or(z.literal('')),
  price: z
    .number({
      required_error: 'El precio es requerido',
      invalid_type_error: 'El precio debe ser un número',
    })
    .min(0, 'El precio debe ser mayor o igual a 0')
    .max(999999.99, 'El precio es demasiado alto'),
  cost: z
    .number({
      invalid_type_error: 'El costo debe ser un número',
    })
    .min(0, 'El costo debe ser mayor o igual a 0')
    .max(999999.99, 'El costo es demasiado alto')
    .optional(),
  isCustom: z.boolean(),
})

export type ProductFormValues = z.infer<typeof productFormSchema>

interface ProductFormProps {
  defaultValues?: Partial<ProductFormValues>
  productId?: string
  onSuccess?: () => void
  onCancel?: () => void
}

export function ProductForm({
  defaultValues,
  productId,
  onSuccess,
  onCancel,
}: ProductFormProps) {
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: defaultValues?.name || '',
      description: defaultValues?.description || '',
      sku: defaultValues?.sku || '',
      barcode: defaultValues?.barcode || '',
      price: defaultValues?.price || 0,
      cost: defaultValues?.cost || undefined,
      isCustom: defaultValues?.isCustom ?? false,
    },
  })

  const createProduct = useCreateProduct()
  const updateProduct = useUpdateProduct()

  const onSubmit = async (data: ProductFormValues) => {
    try {
      if (productId) {
        await updateProduct.mutateAsync({
          id: productId,
          data,
        })
      } else {
        await createProduct.mutateAsync(data)
        form.reset()
      }
      onSuccess?.()
    } catch (error) {
      // Error handling is done in the hooks
    }
  }

  const isLoading = createProduct.isPending || updateProduct.isPending

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Nombre del Producto <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Laptop Dell XPS 13"
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
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Descripción detallada del producto..."
                  disabled={isLoading}
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="sku"
            render={({ field }) => (
              <FormItem>
                <FormLabel>SKU</FormLabel>
                <FormControl>
                  <Input
                    placeholder="DELL-XPS-001"
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Código interno del producto
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="barcode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Código de Barras</FormLabel>
                <FormControl>
                  <Input
                    placeholder="123456789012"
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Código de barras para escaneo
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Precio de Venta <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="99.99"
                    disabled={isLoading}
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="cost"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Costo</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="79.99"
                    disabled={isLoading}
                    {...field}
                    value={field.value ?? ''}
                    onChange={(e) => {
                      const value = e.target.value
                      field.onChange(value === '' ? undefined : parseFloat(value))
                    }}
                  />
                </FormControl>
                <FormDescription>
                  Costo del producto (opcional)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="isCustom"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isLoading}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Producto Personalizado</FormLabel>
                <FormDescription>
                  Los productos personalizados no afectan el inventario
                </FormDescription>
              </div>
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
            {productId ? 'Actualizar' : 'Crear'} Producto
          </Button>
        </div>
      </form>
    </Form>
  )
}
