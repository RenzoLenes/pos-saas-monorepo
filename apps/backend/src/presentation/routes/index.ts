import { Router } from 'express'
import { authMiddleware } from '../middleware/auth.middleware'
import { productRoutes } from './product.routes'
import { cartRoutes } from './cart.routes'
import { saleRoutes } from './sale.routes'
import { customerRoutes } from './customer.routes'
import { inventoryRoutes } from './inventory.routes'
import { categoryRoutes } from './category.routes'
import { outletRoutes } from './outlet.routes'
import { userRoutes } from './user.routes'
import { tenantRoutes } from './tenant.routes'
import { authRoutes } from './auth.routes'
import superadminRoutes from './superadmin.routes'

export const routes: Router = Router()

// Public routes
routes.use('/auth', authRoutes)

// Superadmin routes (authentication + role validation handled in route file)
routes.use('/superadmin', superadminRoutes)

// Protected routes (require authentication)
routes.use('/products', authMiddleware, productRoutes)
routes.use('/carts', authMiddleware, cartRoutes)
routes.use('/sales', authMiddleware, saleRoutes)
routes.use('/customers', authMiddleware, customerRoutes)
routes.use('/inventory', authMiddleware, inventoryRoutes)
routes.use('/categories', authMiddleware, categoryRoutes)
routes.use('/outlets', authMiddleware, outletRoutes)
routes.use('/users', authMiddleware, userRoutes)
routes.use('/tenants', authMiddleware, tenantRoutes)
