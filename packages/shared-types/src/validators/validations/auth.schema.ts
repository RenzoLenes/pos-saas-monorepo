import { z } from 'zod'

/**
 * Auth Validation Schemas
 * Centralized validation schemas for authentication and user setup
 */

export const userRoleSchema = z.enum(['admin', 'manager', 'cashier'], {
  errorMap: () => ({ message: 'Rol inválido. Debe ser admin, manager o cashier' }),
})

export const updateUserSchema = z.object({
  firstName: z.string().min(1, 'El nombre es requerido').max(50, 'El nombre es muy largo').optional(),
  lastName: z.string().min(1, 'El apellido es requerido').max(50, 'El apellido es muy largo').optional(),
  outletId: z.string().cuid('ID de outlet inválido').optional(),
})

export const setupUserSchema = z.object({
  clerkId: z.string().min(1, 'Clerk ID es requerido'),
  email: z.string().email('Email inválido'),
  firstName: z.string().min(1, 'El nombre es requerido').max(50, 'El nombre es muy largo'),
  lastName: z.string().min(1, 'El apellido es requerido').max(50, 'El apellido es muy largo'),
  tenantId: z.string().cuid('ID de tenant inválido'),
  role: userRoleSchema.default('admin'),
})

// Type exports
export type UpdateUserInput = z.infer<typeof updateUserSchema>
export type SetupUserInput = z.infer<typeof setupUserSchema>
