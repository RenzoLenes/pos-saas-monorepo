import { Request, Response } from 'express'
import { UseCaseFactory } from '@infrastructure/factories'
import { z } from 'zod'

const updateTenantSchema = z.object({
  name: z.string().min(1).optional(),
  subdomain: z.string().min(1).optional(),
  domain: z.string().nullable().optional(),
})

export class TenantController {
  /**
   * GET /api/tenants/current
   * Get current tenant information
   */
  async getCurrent(req: Request, res: Response): Promise<void> {
    const tenantId = req.user!.tenantId || ''

    const useCase = UseCaseFactory.getGetCurrentTenantUseCase()
    const tenant = await useCase.execute(tenantId)

    res.json({
      success: true,
      data: tenant,
    })
  }

  /**
   * PUT /api/tenants/current
   * Update current tenant information
   */
  async updateCurrent(req: Request, res: Response): Promise<void> {
    const tenantId = req.user!.tenantId || ''
    const data = updateTenantSchema.parse(req.body)

    const useCase = UseCaseFactory.getUpdateCurrentTenantUseCase()
    const updated = await useCase.execute({
      tenantId,
      data,
    })

    res.json({
      success: true,
      data: updated,
    })
  }
}
