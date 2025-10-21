import { z } from 'zod'

/**
 * Tenant Validation Schemas
 * Centralized validation schemas for tenant operations
 */

export const subdomainRegex = /^[a-z0-9-]+$/

export const createTenantSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(100, 'El nombre es muy largo'),
  subdomain: z
    .string()
    .min(1, 'El subdominio es requerido')
    .max(50, 'El subdominio es muy largo')
    .regex(subdomainRegex, 'El subdominio solo puede contener letras minúsculas, números y guiones'),
  ownerClerkId: z.string().min(1, 'Clerk ID del propietario es requerido'),
  ownerEmail: z.string().email('Email del propietario inválido'),
  ownerFirstName: z.string().min(1, 'El nombre del propietario es requerido').max(50, 'El nombre es muy largo'),
  ownerLastName: z.string().min(1, 'El apellido del propietario es requerido').max(50, 'El apellido es muy largo'),
})

export const updateTenantSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(100, 'El nombre es muy largo').optional(),
  domain: z.string().optional(),
})

export const checkSubdomainSchema = z.object({
  subdomain: z.string().min(1, 'El subdominio es requerido'),
})

// Type exports
export type CreateTenantInput = z.infer<typeof createTenantSchema>
export type UpdateTenantInput = z.infer<typeof updateTenantSchema>
export type CheckSubdomainInput = z.infer<typeof checkSubdomainSchema>
