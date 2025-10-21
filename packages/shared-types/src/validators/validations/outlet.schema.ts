import { z } from 'zod'

/**
 * Outlet Validation Schemas
 * Centralized validation schemas for outlet operations
 */

export const outletBaseSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(100, 'El nombre es muy largo'),
  address: z.string().max(200, 'La dirección es muy larga').optional(),
  phone: z.string().max(20, 'El teléfono es muy largo').optional(),
  email: z.string().email('Email inválido').optional(),
  currency: z.string().length(3, 'El código de moneda debe tener 3 caracteres').default('USD'),
  locale: z.string().default('en-US'),
  timezone: z.string().default('UTC'),
})

export const createOutletSchema = outletBaseSchema

export const updateOutletSchema = z.object({
  outletId: z.string().cuid('ID de outlet inválido'),
  name: z.string().min(1, 'El nombre es requerido').max(100, 'El nombre es muy largo').optional(),
  address: z.string().max(200, 'La dirección es muy larga').optional(),
  phone: z.string().max(20, 'El teléfono es muy largo').optional(),
  email: z.string().email('Email inválido').optional(),
  currency: z.string().length(3, 'El código de moneda debe tener 3 caracteres').optional(),
  locale: z.string().optional(),
  timezone: z.string().optional(),
  status: z.string().optional(),
})

export const getOutletByIdSchema = z.object({
  outletId: z.string().cuid('ID de outlet inválido'),
})

export const deleteOutletSchema = z.object({
  outletId: z.string().cuid('ID de outlet inválido'),
})

// Type exports
export type CreateOutletInput = z.infer<typeof createOutletSchema>
export type UpdateOutletInput = z.infer<typeof updateOutletSchema>
export type GetOutletByIdInput = z.infer<typeof getOutletByIdSchema>
export type DeleteOutletInput = z.infer<typeof deleteOutletSchema>
