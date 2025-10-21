import { z } from 'zod'
import { userRoleSchema } from './auth.schema'
/**
 * User Management Validation Schemas
 * Centralized validation schemas for user operations
 */



export const userStatusSchema = z.enum(['active', 'inactive'], {
  errorMap: () => ({ message: 'Estado inválido. Debe ser active o inactive' }),
})

export const getUserByIdSchema = z.object({
  userId: z.string().cuid('ID de usuario inválido'),
})

export const updateUserProfileSchema = z.object({
  userId: z.string().cuid('ID de usuario inválido'),
  firstName: z.string().min(1, 'El nombre es requerido').max(50, 'El nombre es muy largo').optional(),
  lastName: z.string().min(1, 'El apellido es requerido').max(50, 'El apellido es muy largo').optional(),
  role: userRoleSchema.optional(),
  status: userStatusSchema.optional(),
  outletId: z.string().cuid('ID de outlet inválido').optional(),
})

// Type exports
export type GetUserByIdInput = z.infer<typeof getUserByIdSchema>
export type UpdateUserProfileInput = z.infer<typeof updateUserProfileSchema>
export type UserRole = z.infer<typeof userRoleSchema>
export type UserStatus = z.infer<typeof userStatusSchema>
