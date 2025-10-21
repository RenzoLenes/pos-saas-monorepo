import { Request, Response } from 'express'
import { UseCaseFactory } from '@infrastructure/factories'
import { SaleMapper } from '@application/mappers'
import { z } from 'zod'

const completeSaleSchema = z.object({
  cartId: z.string(),
  paymentMethod: z.enum(['cash', 'card', 'mixed']),
  cashReceived: z.number().positive().optional(),
})

const getSalesQuerySchema = z.object({
  outletId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  limit: z.string().optional().transform((val) => (val ? parseInt(val) : undefined)),
  offset: z.string().optional().transform((val) => (val ? parseInt(val) : undefined)),
})

const dailySummaryQuerySchema = z.object({
  outletId: z.string().optional(),
  date: z.string().optional(),
})

const periodSummaryQuerySchema = z.object({
  outletId: z.string().optional(),
  startDate: z.string(),
  endDate: z.string(),
})

export class SaleController {
  /**
   * GET /api/sales
   * Get all sales with filters
   */
  async getAll(req: Request, res: Response): Promise<void> {
    const query = getSalesQuerySchema.parse(req.query)

    const useCase = UseCaseFactory.getGetSalesUseCase()

    const sales = await useCase.execute({
      outletId: query.outletId,
      startDate: query.startDate ? new Date(query.startDate) : undefined,
      endDate: query.endDate ? new Date(query.endDate) : undefined,
      limit: query.limit,
      offset: query.offset,
    })

    const dtos = sales.map((sale) => SaleMapper.toDTO(sale))

    res.json({
      success: true,
      data: dtos,
    })
  }

  /**
   * GET /api/sales/:id
   * Get sale by ID with items
   */
  async getById(req: Request, res: Response): Promise<void> {
    const { id } = req.params

    const useCase = UseCaseFactory.getGetSaleByIdUseCase()

    const sale = await useCase.execute(id)

    res.json({
      success: true,
      data: SaleMapper.toDTO(sale),
    })
  }

  /**
   * POST /api/sales/complete
   * Complete a sale from a cart
   */
  async completeSale(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id
    const data = completeSaleSchema.parse(req.body)

    // Get cart with items
    const getCartUseCase = UseCaseFactory.getGetCartByIdUseCase()
    const cart = await getCartUseCase.execute(data.cartId)

    // Verify cart belongs to user
    if (cart.userId !== userId) {
      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to complete this cart',
        },
      })
      return
    }

    // Verify cart is active
    if (cart.status !== 'active') {
      res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_CART_STATUS',
          message: 'Only active carts can be completed',
        },
      })
      return
    }

    // Verify cart has items
    if (cart.items.length === 0) {
      res.status(400).json({
        success: false,
        error: {
          code: 'EMPTY_CART',
          message: 'Cannot complete an empty cart',
        },
      })
      return
    }

    // Complete sale
    const completeSaleUseCase = UseCaseFactory.getCompleteSaleUseCase()

    const sale = await completeSaleUseCase.execute(
      cart,
      {
        cartId: data.cartId,
        paymentMethod: data.paymentMethod,
        cashReceived: data.cashReceived,
      },
      userId
    )

    // Get sale with relations for mapper
    const getSaleUseCase = UseCaseFactory.getGetSaleByIdUseCase()
    const saleWithRelations = await getSaleUseCase.execute(sale.id)

    res.status(201).json({
      success: true,
      data: SaleMapper.toDTO(saleWithRelations),
      message: 'Sale completed successfully',
    })
  }

  /**
   * GET /api/sales/summary/daily
   * Get daily sales summary
   */
  async getDailySummary(req: Request, res: Response): Promise<void> {
    const query = dailySummaryQuerySchema.parse(req.query)

    const useCase = UseCaseFactory.getGetDailySummaryUseCase()

    const date = query.date ? new Date(query.date) : new Date()
    const summary = await useCase.execute(query.outletId, date)

    res.json({
      success: true,
      data: summary,
    })
  }

  /**
   * GET /api/sales/summary/period
   * Get period sales summary
   */
  async getPeriodSummary(req: Request, res: Response): Promise<void> {
    const query = periodSummaryQuerySchema.parse(req.query)

    const useCase = UseCaseFactory.getGetPeriodSummaryUseCase()

    const summary = await useCase.execute({
      outletId: query.outletId,
      startDate: new Date(query.startDate),
      endDate: new Date(query.endDate),
    })

    res.json({
      success: true,
      data: summary,
    })
  }
}
