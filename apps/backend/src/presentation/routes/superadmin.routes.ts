import { Router } from 'express'
import { SuperadminController } from '@presentation/controllers/superadmin.controller'
import { authMiddleware, requireSuperadmin } from '@presentation/middleware/auth.middleware'

const router: Router = Router()
const controller = new SuperadminController()

// Apply auth middleware to all routes
router.use(authMiddleware)

// Apply superadmin-only middleware to all routes
router.use(requireSuperadmin)

/**
 * GET /api/superadmin/tenants
 * Get all tenants with analytics
 */
router.get('/tenants', (req, res) => controller.getAllTenants(req, res))

/**
 * POST /api/superadmin/tenants
 * Create new tenant with admin user
 */
router.post('/tenants', (req, res) => controller.createTenantWithAdmin(req, res))

/**
 * PUT /api/superadmin/tenants/:id/status
 * Update tenant status (suspend/activate)
 */
router.put('/tenants/:id/status', (req, res) => controller.updateTenantStatus(req, res))

/**
 * GET /api/superadmin/analytics
 * Get global analytics across all tenants
 */
router.get('/analytics', (req, res) => controller.getGlobalAnalytics(req, res))

export default router
