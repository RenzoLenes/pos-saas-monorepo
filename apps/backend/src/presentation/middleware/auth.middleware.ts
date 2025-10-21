import { Request, Response, NextFunction } from 'express'
import { verifyToken } from '@clerk/backend'
import { env } from '@infrastructure/config/env'
import { prisma } from '@infrastructure/database/prisma'
import { logger } from '@infrastructure/logger/logger'

export interface AuthUser {
  id: string
  clerkId: string
  email: string
  role: string
  tenantId: string | null
  outletId?: string
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser
      tenant?: {
        id: string
        name: string
        subdomain: string
        plan: string
        status: string
      } | null
    }
  }
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')

    if (!token) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'No authentication token provided',
        },
      })
      return
    }

    // Verify Clerk token
    const session = await verifyToken(token, {
      secretKey: env.CLERK_SECRET_KEY,
    })

    if (!session) {
      res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid authentication token',
        },
      })
      return
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: session.sub },
      include: {
        tenant: true,
      },
    })

    if (!user) {
      res.status(401).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found in database',
        },
      })
      return
    }

    if (user.status !== 'active') {
      res.status(403).json({
        success: false,
        error: {
          code: 'USER_INACTIVE',
          message: 'User account is not active',
        },
      })
      return
    }

    // ========== SUPERADMIN HANDLING ==========
    if (user.role === 'superadmin') {
      req.user = {
        id: user.id,
        clerkId: user.clerkId,
        email: user.email,
        role: user.role,
        tenantId: null, // Superadmin has no tenant
        outletId: undefined,
      }
      req.tenant = null // No tenant context
      return next()
    }

    // ========== REGULAR USER HANDLING ==========
    if (!user.tenant) {
      res.status(403).json({
        success: false,
        error: {
          code: 'TENANT_NOT_FOUND',
          message: 'User tenant not found',
        },
      })
      return
    }

    if (user.tenant.status !== 'active') {
      res.status(403).json({
        success: false,
        error: {
          code: 'TENANT_INACTIVE',
          message: 'Tenant account is not active',
        },
      })
      return
    }

    // Attach user and tenant to request
    req.user = {
      id: user.id,
      clerkId: user.clerkId,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId!,
      outletId: user.outletId || undefined,
    }

    req.tenant = {
      id: user.tenant.id,
      name: user.tenant.name,
      subdomain: user.tenant.subdomain,
      plan: user.tenant.plan,
      status: user.tenant.status,
    }

    next()
  } catch (error) {
    logger.error(`Auth middleware error: ${error}`)
    res.status(401).json({
      success: false,
      error: {
        code: 'AUTH_ERROR',
        message: 'Authentication failed',
      },
    })
  }
}

// Role-based authorization middleware
export const requireRole = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      })
      return
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Insufficient permissions',
        },
      })
      return
    }

    next()
  }
}

// Superadmin-only authorization middleware
export const requireSuperadmin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required',
      },
    })
    return
  }

  if (req.user.role !== 'superadmin') {
    res.status(403).json({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: 'Superadmin access required',
      },
    })
    return
  }

  next()
}
