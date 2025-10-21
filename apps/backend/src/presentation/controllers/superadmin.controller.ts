import { Request, Response } from 'express'
import { UseCaseFactory } from '@infrastructure/factories'
import { z } from 'zod'

const createTenantSchema = z.object({
  tenantName: z.string().min(1),
  subdomain: z.string().min(3).max(50).regex(/^[a-z0-9-]+$/),
  adminEmail: z.string().email(),
  adminFirstName: z.string().min(1),
  adminLastName: z.string().min(1),
})

const updateTenantStatusSchema = z.object({
  status: z.enum(['active', 'suspended', 'inactive']),
})

export class SuperadminController {
  /**
   * GET /api/superadmin/tenants
   * Get all tenants with analytics
   */
  async getAllTenants(req: Request, res: Response): Promise<void> {
    req.url='/api/superadmin/tenants' // For logging purposes
    const useCase = UseCaseFactory.getGetAllTenantsWithCountsUseCase()
    const tenants = await useCase.execute()

    res.json({
      success: true,
      data: tenants,
    })
  }

  /**
   * POST /api/superadmin/tenants
   * Create new tenant with admin user
   */
  async createTenantWithAdmin(req: Request, res: Response): Promise<void> {
    const data = createTenantSchema.parse(req.body)

    const useCase = UseCaseFactory.getCreateTenantWithAdminUseCase()
    const result = await useCase.execute(data)

    res.status(201).json({
      success: true,
      data: result,
      message: 'Tenant created and invitation sent to admin',
    })
  }

  /**
   * PUT /api/superadmin/tenants/:id/status
   * Update tenant status (suspend/activate)
   */
  async updateTenantStatus(req: Request, res: Response): Promise<void> {
    const { id } = req.params
    const { status } = updateTenantStatusSchema.parse(req.body)

    const useCase = UseCaseFactory.getUpdateTenantStatusUseCase()
    const tenant = await useCase.execute({ id, status })

    res.json({
      success: true,
      data: tenant,
      message: `Tenant ${status}`,
    })
  }

  /**
   * GET /api/superadmin/analytics
   * Get global analytics across all tenants
   */
  async getGlobalAnalytics(req: Request, res: Response): Promise<void> {
    req.url='/api/superadmin/analytics' // For logging purposes
    const useCase = UseCaseFactory.getGetGlobalAnalyticsUseCase()
    const analytics = await useCase.execute()

    res.json({
      success: true,
      data: analytics,
    })
  }
}
