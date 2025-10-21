import { BusinessError, ErrorCodes } from '@/domain/errors'

/**
 * Phone Value Object
 * Representa un número de teléfono con validación
 */
export class Phone {
  private constructor(private readonly value: string) {}

  /**
   * Crea un Phone desde un string
   */
  static from(phone: string): Phone {
    const cleanPhone = phone.replace(/\D/g, '')
    if (cleanPhone.length < 7 || cleanPhone.length > 15) {
      throw new BusinessError(
        ErrorCodes.VALIDATION_INVALID_FORMAT,
        'El número de teléfono debe tener entre 7 y 15 dígitos'
      )
    }
    return new Phone(cleanPhone)
  }

  /**
   * Obtiene el valor del teléfono (solo dígitos)
   */
  getValue(): string {
    return this.value
  }

  /**
   * Obtiene el teléfono formateado
   * Formato básico: agrupación de dígitos
   */
  getFormatted(): string {
    // Formato básico - puede mejorarse según país
    const length = this.value.length

    if (length === 10) {
      // Formato: (XXX) XXX-XXXX
      return `(${this.value.substring(0, 3)}) ${this.value.substring(3, 6)}-${this.value.substring(6)}`
    } else if (length === 11) {
      // Formato: X (XXX) XXX-XXXX
      return `${this.value.substring(0, 1)} (${this.value.substring(1, 4)}) ${this.value.substring(4, 7)}-${this.value.substring(7)}`
    }

    // Formato por defecto
    return this.value
  }

  /**
   * Verifica si dos teléfonos son iguales
   */
  equals(other: Phone): boolean {
    return this.value === other.value
  }

  /**
   * Convierte el teléfono a string
   */
  toString(): string {
    return this.value
  }
}
