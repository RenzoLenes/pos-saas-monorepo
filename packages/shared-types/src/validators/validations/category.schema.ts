import { z } from 'zod'

/**
 * Category Validation Schemas
 * Centralized validation schemas for category operations
 */

export const categoryBaseSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(100, 'El nombre es muy largo'),
  description: z.string().max(500, 'La descripción es muy larga').optional(),
})

export const createCategorySchema = categoryBaseSchema

export const updateCategorySchema = z.object({
  categoryId: z.string().cuid('ID de categoría inválido'),
  name: z.string().min(1, 'El nombre es requerido').max(100, 'El nombre es muy largo').optional(),
  description: z.string().max(500, 'La descripción es muy larga').optional(),
})

export const deleteCategorySchema = z.object({
  categoryId: z.string().cuid('ID de categoría inválido'),
})

// Type exports
export type CreateCategoryInput = z.infer<typeof createCategorySchema>
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>
export type DeleteCategoryInput = z.infer<typeof deleteCategorySchema>
