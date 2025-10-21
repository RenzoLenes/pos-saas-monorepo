import { Router } from 'express'
import { SaleController } from '../controllers/sale.controller'

const router: Router = Router()
const controller = new SaleController()

/**
 * @swagger
 * /api/sales/summary/daily:
 *   get:
 *     summary: Get daily sales summary
 *     description: Retrieve sales summary for today or a specific date (outlet-level)
 *     tags: [Sales]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Date to get summary for (defaults to today)
 *         example: "2025-01-15"
 *     responses:
 *       200:
 *         description: Daily summary retrieved successfully
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
 *                     date:
 *                       type: string
 *                       format: date
 *                     totalSales:
 *                       type: integer
 *                       example: 45
 *                     totalRevenue:
 *                       type: number
 *                       format: decimal
 *                       example: 15750.50
 *                     averageTicket:
 *                       type: number
 *                       format: decimal
 *                       example: 350.01
 *                     paymentMethods:
 *                       type: object
 *                       properties:
 *                         cash:
 *                           type: number
 *                           example: 8500.00
 *                         card:
 *                           type: number
 *                           example: 7250.50
 *                         mixed:
 *                           type: number
 *                           example: 0
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/summary/daily', (req, res) => controller.getDailySummary(req, res))

/**
 * @swagger
 * /api/sales/summary/period:
 *   get:
 *     summary: Get period sales summary
 *     description: Retrieve sales summary for a date range (outlet-level)
 *     tags: [Sales]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date of period
 *         example: "2025-01-01"
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: End date of period
 *         example: "2025-01-31"
 *     responses:
 *       200:
 *         description: Period summary retrieved successfully
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
 *                     startDate:
 *                       type: string
 *                       format: date
 *                     endDate:
 *                       type: string
 *                       format: date
 *                     totalSales:
 *                       type: integer
 *                       example: 1250
 *                     totalRevenue:
 *                       type: number
 *                       format: decimal
 *                       example: 487500.75
 *                     averageTicket:
 *                       type: number
 *                       format: decimal
 *                       example: 390.00
 *                     paymentMethods:
 *                       type: object
 *                       properties:
 *                         cash:
 *                           type: number
 *                         card:
 *                           type: number
 *                         mixed:
 *                           type: number
 *                     dailyBreakdown:
 *                       type: array
 *                       description: Daily sales data for the period
 *       400:
 *         description: Missing or invalid date parameters
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
router.get('/summary/period', (req, res) => controller.getPeriodSummary(req, res))

/**
 * @swagger
 * /api/sales/complete:
 *   post:
 *     summary: Complete sale from cart
 *     description: Convert an active cart to a completed sale transaction with payment details
 *     tags: [Sales]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cartId
 *               - paymentMethod
 *             properties:
 *               cartId:
 *                 type: string
 *                 example: "clxxxxx"
 *                 description: ID of the cart to complete
 *               paymentMethod:
 *                 type: string
 *                 enum: [cash, card, mixed]
 *                 example: "cash"
 *                 description: Payment method used
 *               cashReceived:
 *                 type: number
 *                 format: decimal
 *                 example: 500.00
 *                 description: Amount of cash received (required for cash and mixed payments)
 *               cardAmount:
 *                 type: number
 *                 format: decimal
 *                 example: 0
 *                 description: Amount paid by card (required for mixed payments)
 *     responses:
 *       201:
 *         description: Sale completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   allOf:
 *                     - $ref: '#/components/schemas/Sale'
 *                     - type: object
 *                       properties:
 *                         items:
 *                           type: array
 *                           description: Sale items with product details
 *       400:
 *         description: Validation error (empty cart, insufficient cash, etc.)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Cart not found
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
router.post('/complete', (req, res) => controller.completeSale(req, res))

/**
 * @swagger
 * /api/sales:
 *   get:
 *     summary: Get all sales
 *     description: Retrieve a paginated list of sales for the user's outlet
 *     tags: [Sales]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Number of items per page
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter sales from this date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter sales until this date
 *     responses:
 *       200:
 *         description: Sales retrieved successfully
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
 *                     $ref: '#/components/schemas/Sale'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
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
 * /api/sales/{id}:
 *   get:
 *     summary: Get sale by ID
 *     description: Retrieve detailed information about a specific sale including all items
 *     tags: [Sales]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Sale ID
 *         example: "clxxxxx"
 *     responses:
 *       200:
 *         description: Sale found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   allOf:
 *                     - $ref: '#/components/schemas/Sale'
 *                     - type: object
 *                       properties:
 *                         items:
 *                           type: array
 *                           description: Sale items with product details
 *                         customer:
 *                           type: object
 *                           nullable: true
 *                           description: Customer information if assigned
 *                         user:
 *                           type: object
 *                           description: Cashier who processed the sale
 *       404:
 *         description: Sale not found
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

export const saleRoutes = router
