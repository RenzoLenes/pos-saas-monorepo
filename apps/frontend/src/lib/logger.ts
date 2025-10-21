/**
 * Simple logger utility for the application
 * Provides different log levels and can be extended for production logging
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug'

interface LogEntry {
  level: LogLevel
  message: string
  timestamp: Date
  data?: unknown
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development'

  private log(level: LogLevel, message: string, data?: unknown) {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      data,
    }

    // In development, log to console
    if (this.isDevelopment) {
      const timestamp = entry.timestamp.toISOString()
      const prefix = `[${timestamp}] [${level.toUpperCase()}]`

      switch (level) {
        case 'error':
          console.error(prefix, message, data || '')
          break
        case 'warn':
          console.warn(prefix, message, data || '')
          break
        case 'debug':
          console.debug(prefix, message, data || '')
          break
        case 'info':
        default:
          console.log(prefix, message, data || '')
      }
    }

    // In production, you could send to a logging service
    // if (!this.isDevelopment) {
    //   sendToLoggingService(entry)
    // }
  }

  info(message: string, data?: unknown) {
    this.log('info', message, data)
  }

  warn(message: string, data?: unknown) {
    this.log('warn', message, data)
  }

  error(message: string, data?: unknown) {
    this.log('error', message, data)
  }

  debug(message: string, data?: unknown) {
    this.log('debug', message, data)
  }
}

export const logger = new Logger()
