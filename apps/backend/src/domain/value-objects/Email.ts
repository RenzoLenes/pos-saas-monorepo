import { BusinessError, ErrorCodes } from '@/domain/errors'

/**
 * Email Value Object
 * Representa un email con validación de formato
 */
export class Email {
  private constructor(private readonly value: string) {}

  /**
   * Crea un Email desde un string
   */
  static from(email: string): Email {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      throw new BusinessError(
        ErrorCodes.VALIDATION_INVALID_FORMAT,
        'El formato del email es inválido'
      )
    }
    return new Email(email.toLowerCase())
  }

  /**
   * Obtiene el valor del email
   */
  getValue(): string {
    return this.value
  }

  /**
   * Verifica si dos emails son iguales
   */
  equals(other: Email): boolean {
    return this.value === other.value
  }

  /**
   * Obtiene el dominio del email
   */
  getDomain(): string {
    return this.value.split('@')[1]
  }

  /**
   * Obtiene el nombre local del email (antes del @)
   */
  getLocalPart(): string {
    return this.value.split('@')[0]
  }

  /**
   * Convierte el email a string
   */
  toString(): string {
    return this.value
  }
}
