import { z } from 'zod'

/**
 * Product Validation Schemas
 * Centralized validation schemas for product-related operations
 */

// Base product fields
export const productBaseSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(100, 'El nombre es muy largo'),
  description: z.string().max(500, 'La descripción es muy larga').optional(),
  sku: z.string().max(50, 'El SKU es muy largo').optional(),
  barcode: z.string().max(50, 'El código de barras es muy largo').optional(),
  price: z.number().positive('El precio debe ser positivo'),
  cost: z.number().positive('El costo debe ser positivo').optional(),
  categoryId: z.string().cuid('ID de categoría inválido').optional(),
  isCustom: z.boolean().default(false),
})

// Create product schema
export const createProductSchema = productBaseSchema

// Update product schema (all fields optional except ID)
export const updateProductSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(100, 'El nombre es muy largo').optional(),
  description: z.string().max(500, 'La descripción es muy larga').optional(),
  sku: z.string().max(50, 'El SKU es muy largo').optional(),
  barcode: z.string().max(50, 'El código de barras es muy largo').optional(),
  price: z.number().positive('El precio debe ser positivo').optional(),
  cost: z.number().positive('El costo debe ser positivo').optional(),
  categoryId: z.string().cuid('ID de categoría inválido').optional(),
  isActive: z.boolean().optional(),
})

// Get products query schema
export const getProductsQuerySchema = z.object({
  outletId: z.string().cuid('ID de outlet inválido').optional(),
  tenantId: z.string().cuid('ID de tenant inválido').optional(),
  search: z.string().max(100).optional(),
  categoryId: z.string().cuid('ID de categoría inválido').optional(),
  isActive: z.boolean().optional(),
})

// Get all products query schema (with pagination)
export const getAllProductsQuerySchema = z.object({
  search: z.string().max(100).optional(),
  categoryId: z.string().cuid('ID de categoría inválido').optional(),
  isActive: z.boolean().optional(),
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0),
})

// Get product by barcode schema
export const getProductByBarcodeSchema = z.object({
  barcode: z.string().min(1, 'El código de barras es requerido'),
})

// Get product by ID schema
export const getProductByIdSchema = z.object({
  productId: z.string().cuid('ID de producto inválido'),
})

// Delete product schema
export const deleteProductSchema = z.object({
  productId: z.string().cuid('ID de producto inválido'),
})

// Create custom product schema (for POS)
export const createCustomProductSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(100, 'El nombre es muy largo'),
  price: z.number().positive('El precio debe ser positivo'),
})

// Type exports
export type CreateProductInput = z.infer<typeof createProductSchema>
export type UpdateProductInput = z.infer<typeof updateProductSchema>
export type GetProductsQueryInput = z.infer<typeof getProductsQuerySchema>
export type GetAllProductsQueryInput = z.infer<typeof getAllProductsQuerySchema>
export type GetProductByBarcodeInput = z.infer<typeof getProductByBarcodeSchema>
export type GetProductByIdInput = z.infer<typeof getProductByIdSchema>
export type DeleteProductInput = z.infer<typeof deleteProductSchema>
export type CreateCustomProductInput = z.infer<typeof createCustomProductSchema>
