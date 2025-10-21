import { Request, Response } from 'express'
import { UseCaseFactory } from '@infrastructure/factories'
import { z } from 'zod'

const createOutletSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  currency: z.string().default('USD'),
  locale: z.string().default('en-US'),
  timezone: z.string().default('UTC'),
})

const updateOutletSchema = z.object({
  name: z.string().min(1).optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  currency: z.string().optional(),
  locale: z.string().optional(),
  timezone: z.string().optional(),
  status: z.enum(['active', 'inactive']).optional(),
})

const getOutletsQuerySchema = z.object({
  status: z.enum(['active', 'inactive']).optional(),
  limit: z.number().int().positive().optional(),
  offset: z.number().int().min(0).optional(),
})

export class OutletController {
  /**
   * GET /api/outlets
   * Get all outlets for the tenant
   */
  async getAll(req: Request, res: Response): Promise<void> {
    const tenantId = req.user!.tenantId || ''
    const query = getOutletsQuerySchema.parse({
      status: req.query.status as string | undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      offset: req.query.offset ? parseInt(req.query.offset as string) : undefined,
    })

    const useCase = UseCaseFactory.getGetAllOutletsUseCase()
    const outlets = await useCase.execute({
      tenantId,
      status: query.status,
      limit: query.limit,
      offset: query.offset,
    })

    res.json({
      success: true,
      data: outlets,
    })
  }

  /**
   * GET /api/outlets/:id
   * Get outlet by ID
   */
  async getById(req: Request, res: Response): Promise<void> {
    const { id } = req.params
    const tenantId = req.user!.tenantId || ''

    const useCase = UseCaseFactory.getGetOutletByIdUseCase()
    const outlet = await useCase.execute(id, tenantId)

    res.json({
      success: true,
      data: outlet,
    })
  }

  /**
   * POST /api/outlets
   * Create a new outlet
   */
  async create(req: Request, res: Response): Promise<void> {
    const tenantId = req.user!.tenantId || ''
    const data = createOutletSchema.parse(req.body)

    const useCase = UseCaseFactory.getCreateOutletUseCase()
    const outlet = await useCase.execute({
      ...data,
      tenantId,
    })

    res.status(201).json({
      success: true,
      data: outlet,
    })
  }

  /**
   * PUT /api/outlets/:id
   * Update outlet
   */
  async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params
    const tenantId = req.user!.tenantId || ''
    const data = updateOutletSchema.parse(req.body)

    const useCase = UseCaseFactory.getUpdateOutletUseCase()
    const updated = await useCase.execute({
      id,
      tenantId,
      data,
    })

    res.json({
      success: true,
      data: updated,
    })
  }

  /**
   * DELETE /api/outlets/:id
   * Delete outlet
   */
  async delete(req: Request, res: Response): Promise<void> {
    const { id } = req.params
    const tenantId = req.user!.tenantId || ''

    const useCase = UseCaseFactory.getDeleteOutletUseCase()
    await useCase.execute({ id, tenantId })

    res.json({
      success: true,
      message: 'Outlet deleted successfully',
    })
  }
}
