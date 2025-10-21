import { BusinessError, ErrorCodes } from '@/domain/errors'
import { Money } from '@/domain/value-objects/Money'

/**
 * Product Entity
 * Representa un producto con toda su lógica de negocio
 */
export class Product {
  constructor(
    public readonly id: string,
    private _name: string,
    private _price: Money,
    private _isActive: boolean = true,
    private _description?: string,
    private _sku?: string,
    private _barcode?: string,
    private _cost?: Money,
    private _categoryId?: string,
    public readonly isCustom: boolean = false,
    public readonly tenantId: string = ''
  ) {
    this.validate()
  }

  // Getters
  get name(): string {
    return this._name
  }

  get price(): Money {
    return this._price
  }

  get isActive(): boolean {
    return this._isActive
  }

  get description(): string | undefined {
    return this._description
  }

  get sku(): string | undefined {
    return this._sku
  }

  get barcode(): string | undefined {
    return this._barcode
  }

  get cost(): Money | undefined {
    return this._cost
  }

  get categoryId(): string | undefined {
    return this._categoryId
  }

  // Business Logic Methods

  /**
   * Valida el producto
   */
  private validate(): void {
    if (!this._name || this._name.trim().length === 0) {
      throw new BusinessError(
        ErrorCodes.VALIDATION_REQUIRED_FIELD,
        'El nombre del producto es requerido'
      )
    }

    if (this._price.isNegativeOrZero()) {
      throw new BusinessError(
        ErrorCodes.BUSINESS_INVALID_OPERATION,
        'El precio del producto debe ser mayor a cero'
      )
    }

    if (this._cost && this._cost.isNegative()) {
      throw new BusinessError(
        ErrorCodes.BUSINESS_INVALID_OPERATION,
        'El costo del producto no puede ser negativo'
      )
    }
  }

  /**
   * Actualiza el nombre del producto
   */
  updateName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new BusinessError(
        ErrorCodes.VALIDATION_REQUIRED_FIELD,
        'El nombre del producto es requerido'
      )
    }
    this._name = name.trim()
  }

  /**
   * Actualiza el precio del producto
   */
  updatePrice(price: number): void {
    const newPrice = Money.from(price)
    if (newPrice.isNegativeOrZero()) {
      throw new BusinessError(
        ErrorCodes.BUSINESS_INVALID_OPERATION,
        'El precio del producto debe ser mayor a cero'
      )
    }
    this._price = newPrice
  }

  /**
   * Actualiza el costo del producto
   */
  updateCost(cost: number): void {
    const newCost = Money.from(cost)
    if (newCost.isNegative()) {
      throw new BusinessError(
        ErrorCodes.BUSINESS_INVALID_OPERATION,
        'El costo del producto no puede ser negativo'
      )
    }
    this._cost = newCost
  }

  /**
   * Actualiza la descripción del producto
   */
  updateDescription(description: string | undefined): void {
    this._description = description
  }

  /**
   * Actualiza el SKU del producto
   */
  updateSKU(sku: string | undefined): void {
    this._sku = sku
  }

  /**
   * Actualiza el código de barras del producto
   */
  updateBarcode(barcode: string | undefined): void {
    this._barcode = barcode
  }

  /**
   * Actualiza la categoría del producto
   */
  updateCategory(categoryId: string | undefined): void {
    this._categoryId = categoryId
  }

  /**
   * Activa el producto
   */
  activate(): void {
    this._isActive = true
  }

  /**
   * Desactiva el producto
   */
  deactivate(): void {
    this._isActive = false
  }

  /**
   * Calcula el margen de ganancia
   */
  calculateProfitMargin(): number | undefined {
    if (!this._cost) {
      return undefined
    }

    const profit = this._price.subtract(this._cost)
    return (profit.getValue() / this._cost.getValue()) * 100
  }

  /**
   * Calcula el margen de ganancia en dinero
   */
  calculateProfit(): Money | undefined {
    if (!this._cost) {
      return undefined
    }

    return this._price.subtract(this._cost)
  }

  /**
   * Verifica si el producto tiene código de barras
   */
  hasBarcode(): boolean {
    return this._barcode !== undefined && this._barcode.trim().length > 0
  }

  /**
   * Verifica si el producto tiene SKU
   */
  hasSKU(): boolean {
    return this._sku !== undefined && this._sku.trim().length > 0
  }

  /**
   * Verifica si el producto pertenece a una categoría
   */
  hasCategory(): boolean {
    return this._categoryId !== undefined
  }

  /**
   * Verifica si el producto puede ser agregado al carrito
   */
  canBeAddedToCart(): { canAdd: boolean; reason?: string } {
    if (!this._isActive) {
      return {
        canAdd: false,
        reason: 'El producto no está activo',
      }
    }

    if (this._price.isNegativeOrZero()) {
      return {
        canAdd: false,
        reason: 'El producto tiene un precio inválido',
      }
    }

    return { canAdd: true }
  }

  /**
   * Factory method para crear un producto normal
   */
  static create(
    id: string,
    tenantId: string,
    name: string,
    price: number,
    options?: {
      description?: string
      sku?: string
      barcode?: string
      cost?: number
      categoryId?: string
    }
  ): Product {
    return new Product(
      id,
      name,
      Money.from(price),
      true,
      options?.description,
      options?.sku,
      options?.barcode,
      options?.cost ? Money.from(options.cost) : undefined,
      options?.categoryId,
      false,
      tenantId
    )
  }

  /**
   * Factory method para crear un producto personalizado
   */
  static createCustom(id: string, tenantId: string, name: string, price: number): Product {
    return new Product(
      id,
      name,
      Money.from(price),
      true,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      true,
      tenantId
    )
  }

  /**
   * Factory method para reconstruir un producto desde la base de datos
   */
  static fromPersistence(data: {
    id: string
    name: string
    price: number
    isActive: boolean
    description?: string
    sku?: string
    barcode?: string
    cost?: number
    categoryId?: string
    isCustom: boolean
    tenantId: string
  }): Product {
    return new Product(
      data.id,
      data.name,
      Money.from(data.price),
      data.isActive,
      data.description,
      data.sku,
      data.barcode,
      data.cost ? Money.from(data.cost) : undefined,
      data.categoryId,
      data.isCustom,
      data.tenantId
    )
  }

  /**
   * Convierte el producto a formato para persistencia
   */
  toPersistence() {
    return {
      id: this.id,
      name: this._name,
      price: this._price.getValue(),
      isActive: this._isActive,
      description: this._description,
      sku: this._sku,
      barcode: this._barcode,
      cost: this._cost?.getValue(),
      categoryId: this._categoryId,
      isCustom: this.isCustom,
      tenantId: this.tenantId,
    }
  }
}
