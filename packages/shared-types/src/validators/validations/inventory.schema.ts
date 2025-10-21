import { z } from 'zod'

/**
 * Inventory Validation Schemas
 * Centralized validation schemas for inventory-related operations
 */

// Inventory operation enum
export const inventoryOperationSchema = z.enum(['SET', 'ADD', 'SUBTRACT'], {
  errorMap: () => ({ message: 'Operación de inventario inválida' })
})

// Get inventory by outlet schema
export const getInventoryByOutletSchema = z.object({
  outletId: z.string().cuid('ID de outlet inválido'),
  search: z.string().max(100).optional(),
  lowStock: z.boolean().optional(),
  limit: z.number().min(1).max(200).default(50),
  offset: z.number().min(0).default(0),
})

// Update inventory quantity schema
export const updateInventoryQuantitySchema = z.object({
  inventoryId: z.string().cuid('ID de inventario inválido'),
  quantity: z.number().min(0, 'La cantidad debe ser mayor o igual a 0'),
  operation: inventoryOperationSchema.default('SET'),
})

// Update min stock schema
export const updateMinStockSchema = z.object({
  inventoryId: z.string().cuid('ID de inventario inválido'),
  minStock: z.number().min(0, 'El stock mínimo debe ser mayor o igual a 0'),
})

// Get low stock schema
export const getLowStockSchema = z.object({
  outletId: z.string().cuid('ID de outlet inválido'),
})

// Bulk update inventory schema
export const bulkUpdateInventorySchema = z.object({
  updates: z.array(
    z.object({
      inventoryId: z.string().cuid('ID de inventario inválido'),
      quantity: z.number().min(0, 'La cantidad debe ser mayor o igual a 0'),
      operation: inventoryOperationSchema.default('ADD'),
    })
  ).min(1, 'Debe proporcionar al menos una actualización'),
})

// Transfer inventory schema
export const transferInventorySchema = z.object({
  productId: z.string().cuid('ID de producto inválido'),
  fromOutletId: z.string().cuid('ID de outlet de origen inválido'),
  toOutletId: z.string().cuid('ID de outlet de destino inválido'),
  quantity: z.number().positive('La cantidad debe ser mayor a 0'),
}).refine(
  (data) => data.fromOutletId !== data.toOutletId,
  {
    message: 'Los outlets de origen y destino deben ser diferentes',
    path: ['toOutletId'],
  }
)

// Type exports
export type InventoryOperation = z.infer<typeof inventoryOperationSchema>
export type GetInventoryByOutletInput = z.infer<typeof getInventoryByOutletSchema>
export type UpdateInventoryQuantityInput = z.infer<typeof updateInventoryQuantitySchema>
export type UpdateMinStockInput = z.infer<typeof updateMinStockSchema>
export type GetLowStockInput = z.infer<typeof getLowStockSchema>
export type BulkUpdateInventoryInput = z.infer<typeof bulkUpdateInventorySchema>
export type TransferInventoryInput = z.infer<typeof transferInventorySchema>
