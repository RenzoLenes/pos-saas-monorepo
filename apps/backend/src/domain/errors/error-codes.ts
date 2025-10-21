/**
 * Centralized error codes for the application
 * Format: DOMAIN_ERROR_TYPE
 */

export const ErrorCodes = {
  // Authentication & Authorization
  AUTH_UNAUTHORIZED: 'AUTH_UNAUTHORIZED',
  AUTH_FORBIDDEN: 'AUTH_FORBIDDEN',
  AUTH_SESSION_EXPIRED: 'AUTH_SESSION_EXPIRED',
  AUTH_INVALID_CREDENTIALS: 'AUTH_INVALID_CREDENTIALS',

  // Validation
  VALIDATION_INVALID_INPUT: 'VALIDATION_INVALID_INPUT',
  VALIDATION_REQUIRED_FIELD: 'VALIDATION_REQUIRED_FIELD',
  VALIDATION_INVALID_FORMAT: 'VALIDATION_INVALID_FORMAT',
  VALIDATION_INVALID_STATUS: 'VALIDATION_INVALID_STATUS',
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  VALIDATION_ERROR: 'VALIDATION_ERROR',

  // Database
  DB_RECORD_NOT_FOUND: 'DB_RECORD_NOT_FOUND',
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND', // Alias for DB_RECORD_NOT_FOUND
  DB_DUPLICATE_RECORD: 'DB_DUPLICATE_RECORD',
  DB_FOREIGN_KEY_VIOLATION: 'DB_FOREIGN_KEY_VIOLATION',
  DB_CONSTRAINT_VIOLATION: 'DB_CONSTRAINT_VIOLATION',
  DB_CONNECTION_ERROR: 'DB_CONNECTION_ERROR',

  // Business Logic
  BUSINESS_INSUFFICIENT_STOCK: 'BUSINESS_INSUFFICIENT_STOCK',
  BUSINESS_INVALID_DISCOUNT: 'BUSINESS_INVALID_DISCOUNT',
  BUSINESS_INVALID_PAYMENT: 'BUSINESS_INVALID_PAYMENT',
  BUSINESS_CART_EMPTY: 'BUSINESS_CART_EMPTY',
  BUSINESS_CUSTOMER_REQUIRED: 'BUSINESS_CUSTOMER_REQUIRED',
  BUSINESS_OUTLET_REQUIRED: 'BUSINESS_OUTLET_REQUIRED',
  BUSINESS_INVALID_OPERATION: 'BUSINESS_INVALID_OPERATION',
  BUSINESS_INSUFFICIENT_PERMISSIONS: 'BUSINESS_INSUFFICIENT_PERMISSIONS',
  BUSINESS_DUPLICATE_ENTRY: 'BUSINESS_DUPLICATE_ENTRY',
  FORBIDDEN: 'FORBIDDEN',

  // Sync & Offline
  SYNC_FAILED: 'SYNC_FAILED',
  SYNC_CONFLICT: 'SYNC_CONFLICT',
  OFFLINE_OPERATION_FAILED: 'OFFLINE_OPERATION_FAILED',

  // General
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const

export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes]

/**
 * Maps error codes to user-friendly messages (Spanish)
 */
export const ErrorMessages: Record<ErrorCode, string> = {
  // Authentication & Authorization
  AUTH_UNAUTHORIZED: 'No estás autenticado. Por favor inicia sesión.',
  AUTH_FORBIDDEN: 'No tienes permisos para realizar esta acción.',
  AUTH_SESSION_EXPIRED: 'Tu sesión ha expirado. Por favor inicia sesión nuevamente.',
  AUTH_INVALID_CREDENTIALS: 'Credenciales inválidas.',

  // Validation
  VALIDATION_INVALID_INPUT: 'Los datos ingresados no son válidos.',
  VALIDATION_REQUIRED_FIELD: 'Este campo es requerido.',
  VALIDATION_INVALID_FORMAT: 'El formato de los datos es inválido.',
  VALIDATION_INVALID_STATUS: 'El estado del registro no es válido para esta operación.',
  VALIDATION_FAILED: 'La validación falló.',
  VALIDATION_ERROR: 'Error de validación.',

  // Database
  DB_RECORD_NOT_FOUND: 'El registro solicitado no fue encontrado.',
  RESOURCE_NOT_FOUND: 'El recurso solicitado no fue encontrado.',
  DB_DUPLICATE_RECORD: 'Este registro ya existe.',
  DB_FOREIGN_KEY_VIOLATION: 'No se puede eliminar porque tiene datos relacionados.',
  DB_CONSTRAINT_VIOLATION: 'La operación viola una restricción de la base de datos.',
  DB_CONNECTION_ERROR: 'Error al conectar con la base de datos.',

  // Business Logic
  BUSINESS_INSUFFICIENT_STOCK: 'Stock insuficiente para completar la operación.',
  BUSINESS_INVALID_DISCOUNT: 'El descuento ingresado no es válido.',
  BUSINESS_INVALID_PAYMENT: 'Los datos de pago no son válidos.',
  BUSINESS_CART_EMPTY: 'El carrito está vacío.',
  BUSINESS_CUSTOMER_REQUIRED: 'Debes seleccionar un cliente.',
  BUSINESS_OUTLET_REQUIRED: 'Debes seleccionar un outlet.',
  BUSINESS_INVALID_OPERATION: 'La operación solicitada no es válida.',
  BUSINESS_INSUFFICIENT_PERMISSIONS: 'No tienes permisos suficientes para realizar esta acción.',
  BUSINESS_DUPLICATE_ENTRY: 'Este registro ya existe en el sistema.',
  FORBIDDEN: 'Acceso prohibido.',

  // Sync & Offline
  SYNC_FAILED: 'Error al sincronizar los datos.',
  SYNC_CONFLICT: 'Conflicto de sincronización. Los datos han sido modificados.',
  OFFLINE_OPERATION_FAILED: 'Error al realizar la operación en modo offline.',

  // General
  INTERNAL_SERVER_ERROR: 'Error interno del servidor. Por favor intenta nuevamente.',
  NETWORK_ERROR: 'Error de conexión. Verifica tu internet.',
  TIMEOUT: 'La operación tomó demasiado tiempo. Por favor intenta nuevamente.',
  UNKNOWN_ERROR: 'Ocurrió un error inesperado.',
}

/**
 * Maps error codes to HTTP status codes
 */
export const ErrorStatusCodes: Record<ErrorCode, number> = {
  // Authentication & Authorization
  AUTH_UNAUTHORIZED: 401,
  AUTH_FORBIDDEN: 403,
  AUTH_SESSION_EXPIRED: 401,
  AUTH_INVALID_CREDENTIALS: 401,

  // Validation
  VALIDATION_INVALID_INPUT: 400,
  VALIDATION_REQUIRED_FIELD: 400,
  VALIDATION_INVALID_FORMAT: 400,
  VALIDATION_INVALID_STATUS: 400,
  VALIDATION_FAILED: 400,
  VALIDATION_ERROR: 400,

  // Database
  DB_RECORD_NOT_FOUND: 404,
  RESOURCE_NOT_FOUND: 404,
  DB_DUPLICATE_RECORD: 409,
  DB_FOREIGN_KEY_VIOLATION: 409,
  DB_CONSTRAINT_VIOLATION: 409,
  DB_CONNECTION_ERROR: 503,

  // Business Logic
  BUSINESS_INSUFFICIENT_STOCK: 400,
  BUSINESS_INVALID_DISCOUNT: 400,
  BUSINESS_INVALID_PAYMENT: 400,
  BUSINESS_CART_EMPTY: 400,
  BUSINESS_CUSTOMER_REQUIRED: 400,
  BUSINESS_OUTLET_REQUIRED: 400,
  BUSINESS_INVALID_OPERATION: 400,
  BUSINESS_INSUFFICIENT_PERMISSIONS: 403,
  BUSINESS_DUPLICATE_ENTRY: 409,
  FORBIDDEN: 403,

  // Sync & Offline
  SYNC_FAILED: 500,
  SYNC_CONFLICT: 409,
  OFFLINE_OPERATION_FAILED: 500,

  // General
  INTERNAL_SERVER_ERROR: 500,
  NETWORK_ERROR: 503,
  TIMEOUT: 504,
  UNKNOWN_ERROR: 500,
}
