import { Request, Response } from 'express'
import { UseCaseFactory } from '@infrastructure/factories'
import { InventoryMapper } from '@application/mappers'
import { z } from 'zod'

const getInventoryQuerySchema = z.object({
  outletId: z.string(),
  limit: z.number().int().positive().optional(),
  offset: z.number().int().min(0).optional(),
})

const transferInventorySchema = z.object({
  productId: z.string(),
  fromOutletId: z.string(),
  toOutletId: z.string(),
  quantity: z.number().int().positive(),
})

const updateStockSchema = z.object({
  productId: z.string(),
  outletId: z.string(),
  quantityChange: z.number().int().optional(),
  minStock: z.number().int().optional(),
  maxStock: z.number().int().optional(),
  reason: z.enum(['purchase', 'sale', 'adjustment', 'transfer', 'return']).optional(),
})

export class InventoryController {
  /**
   * GET /api/inventory
   * Get inventory by outlet
   */
  async getByOutlet(req: Request, res: Response): Promise<void> {
    const query = getInventoryQuerySchema.parse({
      outletId: req.query.outletId,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      offset: req.query.offset ? parseInt(req.query.offset as string) : undefined,
    })

    const useCase = UseCaseFactory.getGetInventoryByOutletWithRelationsUseCase()
    const inventory = await useCase.execute({
      outletId: query.outletId,
      limit: query.limit,
      offset: query.offset,
    })

    const dtos = inventory.map((item) => InventoryMapper.toDTO(item))

    res.json({
      success: true,
      data: dtos,
    })
  }

  /**
   * GET /api/inventory/:id
   * Get inventory item by ID
   */
  async getById(req: Request, res: Response): Promise<void> {
    const { id } = req.params

    const useCase = UseCaseFactory.getGetInventoryByIdWithRelationsUseCase()
    const inventory = await useCase.execute(id)

    res.json({
      success: true,
      data: InventoryMapper.toDTO(inventory),
    })
  }

  /**
   * POST /api/inventory/transfer
   * Transfer inventory between outlets
   */
  async transfer(req: Request, res: Response): Promise<void> {
    const data = transferInventorySchema.parse(req.body)

    const useCase = UseCaseFactory.getTransferInventoryUseCase()

    await useCase.execute({
      productId: data.productId,
      fromOutletId: data.fromOutletId,
      toOutletId: data.toOutletId,
      quantity: data.quantity,
    })

    res.json({
      success: true,
      message: 'Inventory transferred successfully',
    })
  }

  /**
   * PUT /api/inventory/stock
   * Update stock for an inventory item
   */
  async updateStock(req: Request, res: Response): Promise<void> {
    const data = updateStockSchema.parse(req.body)

    const updateStockUseCase = UseCaseFactory.getUpdateStockUseCase()

    const updated = await updateStockUseCase.execute({
      productId: data.productId,
      outletId: data.outletId,
      quantityChange: data.quantityChange || 0,
      minStock: data.minStock,
      maxStock: data.maxStock,
      reason: data.reason,
    })

    // Get updated inventory with relations
    const getInventoryUseCase = UseCaseFactory.getGetInventoryByIdWithRelationsUseCase()
    const updatedWithRelations = await getInventoryUseCase.execute(updated.id)

    res.json({
      success: true,
      data: InventoryMapper.toDTO(updatedWithRelations),
    })
  }

  /**
   * GET /api/inventory/low-stock
   * Get low stock items
   */
  async getLowStock(req: Request, res: Response): Promise<void> {
    const outletId = req.query.outletId as string

    if (!outletId) {
      res.status(400).json({
        success: false,
        error: {
          code: 'OUTLET_REQUIRED',
          message: 'Outlet ID is required',
        },
      })
      return
    }

    const useCase = UseCaseFactory.getGetLowStockWithRelationsUseCase()
    const inventory = await useCase.execute(outletId)

    const dtos = inventory.map((item) => InventoryMapper.toDTO(item))

    res.json({
      success: true,
      data: dtos,
    })
  }
}
