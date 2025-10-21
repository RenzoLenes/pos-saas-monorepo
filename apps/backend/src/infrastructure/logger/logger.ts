import winston from 'winston'
import { env } from '../config/env'

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
}

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  debug: 'blue',
}

winston.addColors(colors)

const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf((info) => `[${info.timestamp}] ${info.level}: ${info.message}`)
)

const transports: winston.transport[] = [
  new winston.transports.Console({
    format,
  }),
]

// Add file transport in production
if (env.NODE_ENV === 'production') {
  transports.push(
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
      format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
    })
  )
}

export const logger = winston.createLogger({
  level: env.LOG_LEVEL,
  levels,
  transports,
})
