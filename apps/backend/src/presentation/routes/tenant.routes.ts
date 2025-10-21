import { Router } from 'express'
import { TenantController } from '../controllers/tenant.controller'

const router: Router = Router()
const controller = new TenantController()

/**
 * @swagger
 * /api/tenants/current:
 *   get:
 *     summary: Get current tenant information
 *     description: Retrieve information about the authenticated user's tenant/organization
 *     tags: [Tenants]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Tenant information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                       example: "Acme Corporation"
 *                     domain:
 *                       type: string
 *                       example: "acme"
 *                     settings:
 *                       type: object
 *                       description: Custom tenant settings (JSON)
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/current', (req, res) => controller.getCurrent(req, res))

/**
 * @swagger
 * /api/tenants/current:
 *   put:
 *     summary: Update current tenant
 *     description: Update tenant/organization information (requires admin role)
 *     tags: [Tenants]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Acme Corporation"
 *               settings:
 *                 type: object
 *                 description: Custom tenant settings as JSON object
 *                 example:
 *                   currency: "USD"
 *                   taxRate: 0.16
 *                   receiptFooter: "Thank you for your purchase!"
 *     responses:
 *       200:
 *         description: Tenant updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     domain:
 *                       type: string
 *                     settings:
 *                       type: object
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/current', (req, res) => controller.updateCurrent(req, res))

export const tenantRoutes = router
