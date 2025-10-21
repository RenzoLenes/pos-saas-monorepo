import { Router } from 'express'
import { OutletController } from '../controllers/outlet.controller'

const router: Router = Router()
const controller = new OutletController()

/**
 * @swagger
 * /api/outlets:
 *   get:
 *     summary: Get all outlets
 *     description: Retrieve all outlets (physical locations) for the authenticated user's tenant
 *     tags: [Outlets]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Outlets retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       address:
 *                         type: string
 *                       phone:
 *                         type: string
 *                       isActive:
 *                         type: boolean
 *                       tenantId:
 *                         type: string
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', (req, res) => controller.getAll(req, res))

/**
 * @swagger
 * /api/outlets/{id}:
 *   get:
 *     summary: Get outlet by ID
 *     description: Retrieve a specific outlet by its ID
 *     tags: [Outlets]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Outlet ID
 *         example: "clxxxxx"
 *     responses:
 *       200:
 *         description: Outlet found
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
 *                     address:
 *                       type: string
 *                     phone:
 *                       type: string
 *                     isActive:
 *                       type: boolean
 *                     tenantId:
 *                       type: string
 *       404:
 *         description: Outlet not found
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
 */
router.get('/:id', (req, res) => controller.getById(req, res))

/**
 * @swagger
 * /api/outlets:
 *   post:
 *     summary: Create outlet
 *     description: Create a new outlet/store location (requires admin role)
 *     tags: [Outlets]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - address
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Main Store"
 *               address:
 *                 type: string
 *                 example: "123 Main St, City, State 12345"
 *               phone:
 *                 type: string
 *                 example: "+1234567890"
 *               isActive:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: Outlet created successfully
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
 *                     address:
 *                       type: string
 *                     phone:
 *                       type: string
 *                     isActive:
 *                       type: boolean
 *                     tenantId:
 *                       type: string
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
router.post('/', (req, res) => controller.create(req, res))

/**
 * @swagger
 * /api/outlets/{id}:
 *   put:
 *     summary: Update outlet
 *     description: Update an existing outlet (requires admin role)
 *     tags: [Outlets]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Outlet ID
 *         example: "clxxxxx"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               address:
 *                 type: string
 *               phone:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Outlet updated successfully
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
 *                     address:
 *                       type: string
 *                     phone:
 *                       type: string
 *                     isActive:
 *                       type: boolean
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Outlet not found
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
 *   delete:
 *     summary: Delete outlet
 *     description: Soft delete an outlet (requires admin role)
 *     tags: [Outlets]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Outlet ID
 *         example: "clxxxxx"
 *     responses:
 *       200:
 *         description: Outlet deleted successfully
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
 *                   example: "Outlet deleted successfully"
 *       404:
 *         description: Outlet not found
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
router.put('/:id', (req, res) => controller.update(req, res))
router.delete('/:id', (req, res) => controller.delete(req, res))

export const outletRoutes = router
