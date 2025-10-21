import { z } from 'zod'

/**
 * Customer Validation Schemas
 * Centralized validation schemas for customer-related operations
 */

// Base customer fields
export const customerBaseSchema = z.object({
  firstName: z.string().min(1, 'El nombre es requerido').max(50, 'El nombre es muy largo'),
  lastName: z.string().min(1, 'El apellido es requerido').max(50, 'El apellido es muy largo'),
  email: z.string().email('Email inválido').optional(),
  phone: z.string().max(20, 'El teléfono es muy largo').optional(),
  address: z.string().max(200, 'La dirección es muy larga').optional(),
})

// Create customer schema
export const createCustomerSchema = customerBaseSchema

// Create customer with tenant schema (for backward compatibility)
export const createCustomerWithTenantSchema = customerBaseSchema.extend({
  tenantId: z.string().cuid('ID de tenant inválido').optional(),
  isActive: z.boolean().default(true),
})

// Update customer schema
export const updateCustomerSchema = z.object({
  customerId: z.string().cuid('ID de cliente inválido'),
  firstName: z.string().min(1, 'El nombre es requerido').max(50, 'El nombre es muy largo').optional(),
  lastName: z.string().min(1, 'El apellido es requerido').max(50, 'El apellido es muy largo').optional(),
  email: z.string().email('Email inválido').optional(),
  phone: z.string().max(20, 'El teléfono es muy largo').optional(),
  address: z.string().max(200, 'La dirección es muy larga').optional(),
  isActive: z.boolean().optional(),
})

// Get customers query schema (public)
export const getCustomersPublicQuerySchema = z.object({
  tenantId: z.string().cuid('ID de tenant inválido'),
  search: z.string().max(100).optional(),
  isActive: z.boolean().optional(),
})

// Get customers query schema (protected)
export const getCustomersQuerySchema = z.object({
  tenantId: z.string().cuid('ID de tenant inválido').optional(),
  search: z.string().max(100).optional(),
  isActive: z.boolean().optional(),
})

// Get all customers query schema (with pagination)
export const getAllCustomersQuerySchema = z.object({
  search: z.string().max(100).optional(),
  isActive: z.boolean().optional(),
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0),
})

// Get customer by ID schema
export const getCustomerByIdSchema = z.object({
  customerId: z.string().cuid('ID de cliente inválido'),
})

// Delete customer schema
export const deleteCustomerSchema = z.object({
  customerId: z.string().cuid('ID de cliente inválido'),
})

// Search customers schema
export const searchCustomersSchema = z.object({
  query: z.string().min(1, 'La búsqueda es requerida').max(100),
  limit: z.number().min(1).max(50).default(10),
})

// Type exports
export type CreateCustomerInput = z.infer<typeof createCustomerSchema>
export type CreateCustomerWithTenantInput = z.infer<typeof createCustomerWithTenantSchema>
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>
export type GetCustomersPublicQueryInput = z.infer<typeof getCustomersPublicQuerySchema>
export type GetCustomersQueryInput = z.infer<typeof getCustomersQuerySchema>
export type GetAllCustomersQueryInput = z.infer<typeof getAllCustomersQuerySchema>
export type GetCustomerByIdInput = z.infer<typeof getCustomerByIdSchema>
export type DeleteCustomerInput = z.infer<typeof deleteCustomerSchema>
export type SearchCustomersInput = z.infer<typeof searchCustomersSchema>
