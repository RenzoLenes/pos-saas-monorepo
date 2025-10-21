import { Request, Response } from 'express'
import { UseCaseFactory } from '@infrastructure/factories'
import { z } from 'zod'

const updateUserSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  role: z.enum(['admin', 'manager', 'cashier']).optional(),
  outletId: z.string().nullable().optional(),
  status: z.enum(['active', 'inactive']).optional(),
})

const getUsersQuerySchema = z.object({
  outletId: z.string().optional(),
  role: z.enum(['admin', 'manager', 'cashier']).optional(),
  status: z.string().optional(),
  limit: z.number().int().positive().optional(),
  offset: z.number().int().min(0).optional(),
})

export class UserController {
  /**
   * GET /api/users
   * Get all users for the tenant
   */
  async getAll(req: Request, res: Response): Promise<void> {
    const tenantId = req.user!.tenantId || ''
    const query = getUsersQuerySchema.parse({
      outletId: req.query.outletId as string | undefined,
      role: req.query.role as 'admin' | 'manager' | 'cashier' | undefined,
      status: req.query.status as string | undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      offset: req.query.offset ? parseInt(req.query.offset as string) : undefined,
    })

    const useCase = UseCaseFactory.getGetAllUsersUseCase()
    const users = await useCase.execute({
      tenantId,
      outletId: query.outletId,
      role: query.role,
      status: query.status,
      limit: query.limit,
      offset: query.offset,
    })

    res.json({
      success: true,
      data: users,
    })
  }

  /**
   * GET /api/users/:id
   * Get user by ID
   */
  async getById(req: Request, res: Response): Promise<void> {
    const { id } = req.params
    const tenantId = req.user!.tenantId || ''

    const useCase = UseCaseFactory.getGetUserByIdUseCase()
    const user = await useCase.execute(id, tenantId)

    res.json({
      success: true,
      data: user,
    })
  }

  /**
   * PUT /api/users/:id
   * Update user (role, outlet assignment, status)
   */
  async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params
    const tenantId = req.user!.tenantId || ''
    const currentUserId = req.user!.id
    const data = updateUserSchema.parse(req.body)

    const useCase = UseCaseFactory.getUpdateUserUseCase()
    const updated = await useCase.execute({
      id,
      tenantId,
      currentUserId,
      data,
    })

    res.json({
      success: true,
      data: updated,
    })
  }
}
