import { BusinessError, ErrorCodes } from '@/domain/errors'
import { Email } from '@/domain/value-objects/Email'
import { Phone } from '@/domain/value-objects/Phone'

/**
 * Customer Entity
 * Representa un cliente con toda su lógica de negocio
 */
export class Customer {
  private _email?: Email
  private _phone?: Phone

  constructor(
    public readonly id: string,
    private _firstName: string,
    private _lastName: string,
    private _address?: string,
    private _isActive: boolean = true,
    public readonly tenantId: string = '',
    email?: string,
    phone?: string
  ) {
    if (email) {
      this._email = Email.from(email)
    }
    if (phone) {
      this._phone = Phone.from(phone)
    }
    this.validate()
  }

  // Getters
  get firstName(): string {
    return this._firstName
  }

  get lastName(): string {
    return this._lastName
  }

  get fullName(): string {
    return `${this._firstName} ${this._lastName}`
  }

  get email(): string | undefined {
    return this._email?.getValue()
  }

  get phone(): string | undefined {
    return this._phone?.getValue()
  }

  get address(): string | undefined {
    return this._address
  }

  get isActive(): boolean {
    return this._isActive
  }

  // Business Logic Methods

  /**
   * Valida el cliente
   */
  private validate(): void {
    if (!this._firstName || this._firstName.trim().length === 0) {
      throw new BusinessError(
        ErrorCodes.VALIDATION_REQUIRED_FIELD,
        'El nombre del cliente es requerido'
      )
    }

    if (!this._lastName || this._lastName.trim().length === 0) {
      throw new BusinessError(
        ErrorCodes.VALIDATION_REQUIRED_FIELD,
        'El apellido del cliente es requerido'
      )
    }

    // Al menos uno de email o phone debe estar presente
    if (!this._email && !this._phone) {
      throw new BusinessError(
        ErrorCodes.VALIDATION_REQUIRED_FIELD,
        'El cliente debe tener al menos un email o teléfono'
      )
    }
  }

  /**
   * Actualiza el nombre del cliente
   */
  updateFirstName(firstName: string): void {
    if (!firstName || firstName.trim().length === 0) {
      throw new BusinessError(
        ErrorCodes.VALIDATION_REQUIRED_FIELD,
        'El nombre del cliente es requerido'
      )
    }
    this._firstName = firstName.trim()
  }

  /**
   * Actualiza el apellido del cliente
   */
  updateLastName(lastName: string): void {
    if (!lastName || lastName.trim().length === 0) {
      throw new BusinessError(
        ErrorCodes.VALIDATION_REQUIRED_FIELD,
        'El apellido del cliente es requerido'
      )
    }
    this._lastName = lastName.trim()
  }

  /**
   * Actualiza el email del cliente
   */
  updateEmail(email: string | undefined): void {
    if (email) {
      this._email = Email.from(email)
    } else {
      if (!this._phone) {
        throw new BusinessError(
          ErrorCodes.VALIDATION_REQUIRED_FIELD,
          'El cliente debe tener al menos un email o teléfono'
        )
      }
      this._email = undefined
    }
  }

  /**
   * Actualiza el teléfono del cliente
   */
  updatePhone(phone: string | undefined): void {
    if (phone) {
      this._phone = Phone.from(phone)
    } else {
      if (!this._email) {
        throw new BusinessError(
          ErrorCodes.VALIDATION_REQUIRED_FIELD,
          'El cliente debe tener al menos un email o teléfono'
        )
      }
      this._phone = undefined
    }
  }

  /**
   * Actualiza la dirección del cliente
   */
  updateAddress(address: string | undefined): void {
    this._address = address
  }

  /**
   * Activa el cliente
   */
  activate(): void {
    this._isActive = true
  }

  /**
   * Desactiva el cliente
   */
  deactivate(): void {
    this._isActive = false
  }

  /**
   * Verifica si el cliente tiene email
   */
  hasEmail(): boolean {
    return this._email !== undefined
  }

  /**
   * Verifica si el cliente tiene teléfono
   */
  hasPhone(): boolean {
    return this._phone !== undefined
  }

  /**
   * Verifica si el cliente tiene dirección
   */
  hasAddress(): boolean {
    return this._address !== undefined && this._address.trim().length > 0
  }

  /**
   * Verifica si el cliente está completo (tiene todos los datos opcionales)
   */
  isComplete(): boolean {
    return this.hasEmail() && this.hasPhone() && this.hasAddress()
  }

  /**
   * Obtiene las iniciales del cliente
   */
  getInitials(): string {
    return `${this._firstName.charAt(0)}${this._lastName.charAt(0)}`.toUpperCase()
  }

  /**
   * Factory method para crear un cliente
   */
  static create(
    id: string,
    tenantId: string,
    firstName: string,
    lastName: string,
    options?: {
      email?: string
      phone?: string
      address?: string
    }
  ): Customer {
    return new Customer(
      id,
      firstName,
      lastName,
      options?.address,
      true,
      tenantId,
      options?.email,
      options?.phone
    )
  }

  /**
   * Factory method para reconstruir un cliente desde la base de datos
   */
  static fromPersistence(data: {
    id: string
    firstName: string
    lastName: string
    email?: string
    phone?: string
    address?: string
    isActive: boolean
    tenantId: string
  }): Customer {
    return new Customer(
      data.id,
      data.firstName,
      data.lastName,
      data.address,
      data.isActive,
      data.tenantId,
      data.email,
      data.phone
    )
  }

  /**
   * Convierte el cliente a formato para persistencia
   */
  toPersistence() {
    return {
      id: this.id,
      firstName: this._firstName,
      lastName: this._lastName,
      email: this._email?.getValue(),
      phone: this._phone?.getValue(),
      address: this._address,
      isActive: this._isActive,
      tenantId: this.tenantId,
    }
  }
}
