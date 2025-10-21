import { type ErrorCode, ErrorMessages, ErrorStatusCodes } from './error-codes'

/**
 * Custom Application Error class
 * Provides structured error handling across the application
 */
export class AppError extends Error {
  public readonly code: ErrorCode
  public readonly statusCode: number
  public readonly isOperational: boolean
  public readonly context?: Record<string, any>
  public readonly timestamp: Date

  constructor(
    code: ErrorCode,
    message?: string,
    context?: Record<string, any>,
    isOperational: boolean = true
  ) {
    // Use custom message if provided, otherwise use default from ErrorMessages
    super(message || ErrorMessages[code])

    this.name = 'AppError'
    this.code = code
    this.statusCode = ErrorStatusCodes[code]
    this.isOperational = isOperational
    this.context = context
    this.timestamp = new Date()

    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, this.constructor)
  }

  /**
   * Returns a JSON representation of the error
   */
  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      timestamp: this.timestamp.toISOString(),
      context: this.context,
      ...(process.env.NODE_ENV === 'development' && { stack: this.stack }),
    }
  }

  /**
   * Returns a user-friendly error object (without sensitive info)
   */
  toUserError() {
    return {
      message: this.message,
      code: this.code,
    }
  }
}

/**
 * Factory functions for common error types
 */

export class ValidationError extends AppError {
  constructor(message?: string, context?: Record<string, any>) {
    super('VALIDATION_INVALID_INPUT', message, context)
    this.name = 'ValidationError'
  }
}

export class AuthenticationError extends AppError {
  constructor(message?: string, context?: Record<string, any>) {
    super('AUTH_UNAUTHORIZED', message, context)
    this.name = 'AuthenticationError'
  }
}

export class AuthorizationError extends AppError {
  constructor(message?: string, context?: Record<string, any>) {
    super('AUTH_FORBIDDEN', message, context)
    this.name = 'AuthorizationError'
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Registro', context?: Record<string, any>) {
    super('DB_RECORD_NOT_FOUND', `${resource} no encontrado`, context)
    this.name = 'NotFoundError'
  }
}

export class DuplicateError extends AppError {
  constructor(resource: string = 'Registro', context?: Record<string, any>) {
    super('DB_DUPLICATE_RECORD', `${resource} ya existe`, context)
    this.name = 'DuplicateError'
  }
}

export class BusinessError extends AppError {
  constructor(messageOrCode: string | ErrorCode, codeOrMessage?: ErrorCode | string, context?: Record<string, any>) {
    // Support both signatures:
    // new BusinessError('message', ErrorCodes.CODE)  <- old format
    // new BusinessError(ErrorCodes.CODE, 'message')  <- new format
    let code: ErrorCode
    let message: string | undefined

    if (typeof messageOrCode === 'string' && typeof codeOrMessage === 'string') {
      // Old format: (message, code)
      message = messageOrCode
      code = codeOrMessage as ErrorCode
    } else if (typeof messageOrCode === 'string' && !codeOrMessage) {
      // New format with just code
      code = messageOrCode as ErrorCode
      message = undefined
    } else {
      // New format: (code, message)
      code = messageOrCode as ErrorCode
      message = codeOrMessage as string | undefined
    }

    super(code, message, context)
    this.name = 'BusinessError'
  }

  // Alias for context to match API error format
  get details() {
    return this.context
  }
}

/**
 * Type guard to check if error is AppError
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError
}

/**
 * Utility to convert unknown errors to AppError
 */
export function toAppError(error: unknown): AppError {
  if (isAppError(error)) {
    return error
  }

  if (error instanceof Error) {
    // Try to map common errors
    if (error.message.includes('not found')) {
      return new NotFoundError(undefined, { originalError: error.message })
    }
    if (error.message.includes('unique constraint') || error.message.includes('duplicate')) {
      return new DuplicateError(undefined, { originalError: error.message })
    }
    if (error.message.includes('foreign key')) {
      return new AppError('DB_FOREIGN_KEY_VIOLATION', undefined, { originalError: error.message })
    }

    // Generic server error
    return new AppError('INTERNAL_SERVER_ERROR', error.message, { originalError: error.message })
  }

  // Unknown error type
  return new AppError('UNKNOWN_ERROR', String(error))
}
