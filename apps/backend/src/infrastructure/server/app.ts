import express, { type Express } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import swaggerUi from 'swagger-ui-express'
import 'express-async-errors'
import { env } from '../config/env'
import { errorMiddleware, notFoundMiddleware } from '@presentation/middleware/error.middleware'
import { routes } from '@presentation/routes'
import { swaggerSpec } from '../swagger/config'

export const createApp = (): Express => {
  const app = express()
  app.set('trust proxy', true); // solo localhost (127.0.0.1)
  // Security middleware
  app.use(helmet())
  app.use(
    cors({
      origin: env.CORS_ORIGIN.split(','),
      credentials: true,
    })
  )

  // Rate limiting
  const limiter = rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_MAX_REQUESTS,
    message: {
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests, please try again later',
      },
    },
  })
  app.use(limiter)

  // Body parsing
  app.use(express.json({ limit: '10mb' }))
  app.use(express.urlencoded({ extended: true, limit: '10mb' }))

  // Compression
  app.use(compression())

  // Logging
  if (env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
  } else {
    app.use(morgan('combined'))
  }

  // Health check
  app.get('/health', (req, res) => {
    req.url = '/'; // Para que pase por el rate limiter
    res.json({
      success: true,
      data: {
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: env.NODE_ENV,
      },
    })
  })

  // Swagger API Documentation
  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'POS SaaS API Documentation',
    })
  )

  // Swagger JSON endpoint
  app.get('/api-docs.json', (_req, res) => {
    res.setHeader('Content-Type', 'application/json')
    res.send(swaggerSpec)
  })

  // API Routes
  app.use(env.API_PREFIX, routes)

  // Error handling
  app.use(notFoundMiddleware)
  app.use(errorMiddleware)

  return app
}
