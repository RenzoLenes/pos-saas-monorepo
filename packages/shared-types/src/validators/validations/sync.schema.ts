import { z } from 'zod'

/**
 * Sync Validation Schemas
 * Centralized validation schemas for offline sync operations
 */

export const syncOperationSchema = z.enum(['create', 'update', 'delete'], {
  errorMap: () => ({ message: 'Operación inválida. Debe ser create, update o delete' }),
})

export const queueOperationSchema = z.object({
  operation: syncOperationSchema,
  table: z.string().min(1, 'La tabla es requerida'),
  recordId: z.string().cuid('ID de registro inválido'),
  data: z.any().optional(),
  outletId: z.string().cuid('ID de outlet inválido').optional(),
})

export const getPendingOperationsSchema = z.object({
  outletId: z.string().cuid('ID de outlet inválido').optional(),
  limit: z.number().int().positive().default(100).optional(),
})

export const processOperationsSchema = z.object({
  operationIds: z.array(z.string().cuid('ID de operación inválido')),
})

// Type exports
export type SyncOperation = z.infer<typeof syncOperationSchema>
export type QueueOperationInput = z.infer<typeof queueOperationSchema>
export type GetPendingOperationsInput = z.infer<typeof getPendingOperationsSchema>
export type ProcessOperationsInput = z.infer<typeof processOperationsSchema>
