import { Router } from 'express'
import { InventoryController } from '../controllers/inventory.controller'

const router: Router = Router()
const controller = new InventoryController()

/**
 * @swagger
 * /api/inventory/low-stock:
 *   get:
 *     summary: Get low stock items
 *     description: Retrieve products with stock below the minimum threshold for the current outlet
 *     tags: [Inventory]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *      - in: query
 *        name: outletId
 *        schema:
 *          type: string
 *        description: Outlet ID to filter low stock items (defaults to authenticated user's outlet)
 *     responses:
 *       200:
 *         description: Low stock items retrieved successfully
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
 *                       productId:
 *                         type: string
 *                       quantity:
 *                         type: integer
 *                       minStock:
 *                         type: integer
 *                       product:
 *                         $ref: '#/components/schemas/Product'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/low-stock', (req, res) => controller.getLowStock(req, res))

/**
 * @swagger
 * /api/inventory/transfer:
 *   post:
 *     summary: Transfer inventory between outlets
 *     description: Transfer stock from one outlet to another (requires admin or manager role)
 *     tags: [Inventory]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - fromOutletId
 *               - toOutletId
 *               - quantity
 *             properties:
 *               productId:
 *                 type: string
 *                 example: "clxxxxx"
 *               fromOutletId:
 *                 type: string
 *                 example: "clxxxxx"
 *               toOutletId:
 *                 type: string
 *                 example: "clyyyyy"
 *               quantity:
 *                 type: integer
 *                 example: 10
 *                 minimum: 1
 *     responses:
 *       200:
 *         description: Inventory transferred successfully
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
 *                   example: "Inventory transferred successfully"
 *       400:
 *         description: Validation error or insufficient stock
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Product or outlet not found
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
router.post('/transfer', (req, res) => controller.transfer(req, res))

/**
 * @swagger
 * /api/inventory:
 *   get:
 *     summary: Get inventory by outlet
 *     description: Retrieve all inventory items for the authenticated user's outlet
 *     tags: [Inventory]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: outletId
 *         schema:
 *           type: string
 *         description: Filter by outlet ID
 *     responses:
 *       200:
 *         description: Inventory retrieved successfully
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
 *                       productId:
 *                         type: string
 *                       outletId:
 *                         type: string
 *                       quantity:
 *                         type: integer
 *                       minStock:
 *                         type: integer
 *                       product:
 *                         $ref: '#/components/schemas/Product'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', (req, res) => controller.getByOutlet(req, res))

/**
 * @swagger
 * /api/inventory/{id}:
 *   get:
 *     summary: Get inventory by ID
 *     description: Retrieve a specific inventory record
 *     tags: [Inventory]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Inventory ID
 *         example: "clxxxxx"
 *     responses:
 *       200:
 *         description: Inventory record found
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
 *                     productId:
 *                       type: string
 *                     outletId:
 *                       type: string
 *                     quantity:
 *                       type: integer
 *                     minStock:
 *                       type: integer
 *                     product:
 *                       $ref: '#/components/schemas/Product'
 *       404:
 *         description: Inventory not found
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
 * /api/inventory/stock:
 *   put:
 *     summary: Update stock
 *     description: Adjust inventory quantity (add or remove stock)
 *     tags: [Inventory]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quantityChange
 *             properties:
 *              productId:
 *               type: string
 *               example: "clxxxxx"
 *               description: Product ID
 *              outletId:
 *               type: string
 *               example: "clxxxxx"
 *               description: Outlet ID
 *              quantityChange:
 *                 type: integer
 *                 example: 50
 *                 description: Stock adjustment (positive to add, negative to remove)
 *              minStock:
 *                 type: integer
 *                 example: 10
 *                 description: Update minimum stock threshold
 *              maxStock:
 *                 type: integer
 *                 example: 100
 *                 description: Update maximum stock threshold
 *     responses:
 *       200:
 *         description: Stock updated successfully
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
 *                     quantity:
 *                       type: integer
 *                     minStock:
 *                       type: integer
 *       400:
 *         description: Validation error or insufficient stock
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Inventory not found
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
router.put('/stock', (req, res) => controller.updateStock(req, res))

export const inventoryRoutes = router
