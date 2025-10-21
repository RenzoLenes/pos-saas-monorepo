import { createApp } from './infrastructure/server/app'
import { env } from './infrastructure/config/env'
import { logger } from './infrastructure/logger/logger'
import { prisma } from './infrastructure/database/prisma'
import { RepositoryFactory } from './infrastructure/factories/RepositoryFactory'

const startServer = async (): Promise<void> => {
  try {
    // Test database connection
    await prisma.$connect()
    logger.info('Database connected successfully')

    // Initialize RepositoryFactory
    RepositoryFactory.initialize(prisma)
    logger.info('RepositoryFactory initialized successfully')

    // Create and start Express app
    const app = createApp()

    const server = app.listen(env.PORT, () => {
      logger.info(`Server started on http://localhost:${env.PORT}`)
      logger.info(`Environment: ${env.NODE_ENV}`)
      logger.info(`API Prefix: ${env.API_PREFIX}`)
    })

    // Graceful shutdown
    const gracefulShutdown = async (signal: string): Promise<void> => {
      logger.info(`\n${signal} received, shutting down gracefully...`)

      server.close(async () => {
        logger.info('HTTP server closed')

        try {
          await prisma.$disconnect()
          logger.info('Database connection closed')
          process.exit(0)
        } catch (error) {
          logger.error('Error during shutdown:', error)
          process.exit(1)
        }
      })

      // Force shutdown after 10 seconds
      setTimeout(() => {
        logger.error('Forced shutdown after timeout')
        process.exit(1)
      }, 10000)
    }

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
    process.on('SIGINT', () => gracefulShutdown('SIGINT'))
  } catch (error) {
    logger.error('Failed to start server:', error)
    process.exit(1)
  }
}

startServer()
