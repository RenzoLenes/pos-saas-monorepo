import { Router } from 'express'
import { AuthController } from '../controllers/auth.controller'
import { authMiddleware } from '../middleware/auth.middleware'

const router: Router = Router()
const controller = new AuthController()

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current authenticated user info
 *     description: Returns complete information about the currently authenticated user including tenant and outlet data
 *     tags: [Auth]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User information retrieved successfully
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
 *                     email:
 *                       type: string
 *                     firstName:
 *                       type: string
 *                     lastName:
 *                       type: string
 *                     role:
 *                       type: string
 *                       enum: [admin, manager, cashier]
 *                     status:
 *                       type: string
 *                     tenantId:
 *                       type: string
 *                     outletId:
 *                       type: string
 *                       nullable: true
 *                     tenant:
 *                       type: object
 *                     outlet:
 *                       type: object
 *                       nullable: true
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/me', authMiddleware, (req, res) => controller.getCurrentUser(req, res))

/**
 * @swagger
 * /api/auth/invite:
 *   post:
 *     summary: Invite a new user to the tenant
 *     description: Send invitation to new user (Admin can invite all roles, Manager can only invite Cashier)
 *     tags: [Auth]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - role
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: newuser@example.com
 *               role:
 *                 type: string
 *                 enum: [admin, manager, cashier]
 *                 example: cashier
 *               outletId:
 *                 type: string
 *                 description: Required for cashier role
 *                 example: clxxxxx
 *     responses:
 *       201:
 *         description: Invitation sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Invitation sent successfully
 *       400:
 *         description: Validation error
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
router.post('/invite', authMiddleware, (req, res) => controller.inviteUser(req, res))

/**
 * @swagger
 * /api/auth/webhook/clerk:
 *   post:
 *     summary: Clerk webhook handler for user synchronization
 *     description: Receives webhook events from Clerk to sync user data (create, update, delete)
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Clerk webhook event payload
 *     responses:
 *       200:
 *         description: Webhook processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Webhook processed
 *       400:
 *         description: Invalid webhook signature or missing headers
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/webhook/clerk', (req, res) => controller.handleClerkWebhook(req, res))

export const authRoutes = router
