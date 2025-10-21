import { z } from 'zod'

/**
 * Sale Validation Schemas
 * Centralized validation schemas for sale-related operations
 */

// Payment method enum
export const paymentMethodSchema = z.enum(['cash', 'card', 'mixed'], {
  errorMap: () => ({ message: 'Método de pago inválido' })
})

// Complete sale schema
export const completeSaleSchema = z.object({
  cartId: z.string().cuid('ID de carrito inválido'),
  paymentMethod: paymentMethodSchema,
  cashReceived: z.number().positive('El efectivo recibido debe ser positivo').optional(),
  cardAmount: z.number().positive('El monto de tarjeta debe ser positivo').optional(),
}).refine(
  (data) => {
    // If payment method is cash, cashReceived is required
    if (data.paymentMethod === 'cash' && !data.cashReceived) {
      return false
    }
    return true
  },
  {
    message: 'El efectivo recibido es requerido para pagos en efectivo',
    path: ['cashReceived'],
  }
)

// Get sales query schema
export const getSalesQuerySchema = z.object({
  outletId: z.union([
    z.string().cuid('ID de outlet inválido'),
    z.literal('')
  ]).optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  limit: z.number().min(1).max(200).default(50),
  offset: z.number().min(0).default(0),
})

// Get sale by ID schema
export const getSaleByIdSchema = z.object({
  saleId: z.string().cuid('ID de venta inválido'),
})

// Get daily summary schema
export const getDailySummarySchema = z.object({
  outletId: z.string().cuid('ID de outlet inválido'),
  date: z.date(),
})

// Get period summary schema
export const getPeriodSummarySchema = z.object({
  startDate: z.date(),
  endDate: z.date(),
  outletId: z.union([
    z.string().cuid('ID de outlet inválido'),
    z.literal('')
  ]).optional(),
}).refine(
  (data) => {
    // Ensure endDate is after startDate
    if (data.endDate < data.startDate) {
      return false
    }
    return true
  },
  {
    message: 'La fecha final debe ser posterior a la fecha inicial',
    path: ['endDate'],
  }
)

// Type exports
export type PaymentMethod = z.infer<typeof paymentMethodSchema>
export type CompleteSaleInput = z.infer<typeof completeSaleSchema>
export type GetSalesQueryInput = z.infer<typeof getSalesQuerySchema>
export type GetSaleByIdInput = z.infer<typeof getSaleByIdSchema>
export type GetDailySummaryInput = z.infer<typeof getDailySummarySchema>
export type GetPeriodSummaryInput = z.infer<typeof getPeriodSummarySchema>
