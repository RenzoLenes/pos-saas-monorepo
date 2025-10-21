import { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'
import { logger } from '@infrastructure/logger/logger'
import { BusinessError } from '@domain/errors'

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export const errorMiddleware = (
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  logger.error(`Error: ${error.message}`, {
    stack: error.stack,
    path: req.path,
    method: req.method,
  })

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        })),
      },
    })
    return
  }

  // Handle Business errors from domain
  if (error instanceof BusinessError) {
    res.status(400).json({
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
      },
    })
    return
  }

  // Handle custom API errors
  if (error instanceof ApiError) {
    res.status(error.statusCode).json({
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
      },
    })
    return
  }

  // Handle Prisma errors
  if (error.name === 'PrismaClientKnownRequestError') {
    const prismaError = error as any

    if (prismaError.code === 'P2002') {
      res.status(409).json({
        success: false,
        error: {
          code: 'DUPLICATE_ERROR',
          message: 'A record with this value already exists',
          details: { field: prismaError.meta?.target },
        },
      })
      return
    }

    if (prismaError.code === 'P2025') {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Record not found',
        },
      })
      return
    }
  }

  // Default 500 error
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : error.message,
    },
  })
}

// Not found middleware
export const notFoundMiddleware = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.path} not found`,
    },
  })
}
