import { Request, Response } from 'express'
import { UseCaseFactory } from '@/infrastructure/factories'
import { z } from 'zod'

const createCategorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
})

const updateCategorySchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
})

export class CategoryController {
  /**
   * GET /api/categories
   * Get all categories for the tenant
   */
  async getAll(req: Request, res: Response): Promise<void> {
    const tenantId = req.user!.tenantId || ''

    const useCase = UseCaseFactory.getGetAllCategoriesUseCase()
    const categories = await useCase.execute(tenantId)

    res.json({
      success: true,
      data: categories,
    })
  }

  /**
   * GET /api/categories/:id
   * Get category by ID
   */
  async getById(req: Request, res: Response): Promise<void> {
    const { id } = req.params
    const tenantId = req.user!.tenantId || ''

    const useCase = UseCaseFactory.getGetCategoryByIdUseCase()
    const category = await useCase.execute(id, tenantId)

    res.json({
      success: true,
      data: category,
    })
  }

  /**
   * POST /api/categories
   * Create a new category
   */
  async create(req: Request, res: Response): Promise<void> {
    const tenantId = req.user!.tenantId || ''
    const data = createCategorySchema.parse(req.body)

    const useCase = UseCaseFactory.getCreateCategoryUseCase()
    const category = await useCase.execute({
      ...data,
      tenantId,
    })

    res.status(201).json({
      success: true,
      data: category,
    })
  }

  /**
   * PUT /api/categories/:id
   * Update category
   */
  async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params
    const tenantId = req.user!.tenantId || ''
    const data = updateCategorySchema.parse(req.body)

    const useCase = UseCaseFactory.getUpdateCategoryUseCase()
    const updated = await useCase.execute(id, tenantId, data)

    res.json({
      success: true,
      data: updated,
    })
  }

  /**
   * DELETE /api/categories/:id
   * Delete category
   */
  async delete(req: Request, res: Response): Promise<void> {
    const { id } = req.params
    const tenantId = req.user!.tenantId || ''

    const useCase = UseCaseFactory.getDeleteCategoryUseCase()
    await useCase.execute(id, tenantId)

    res.json({
      success: true,
      message: 'Category deleted successfully',
    })
  }
}
