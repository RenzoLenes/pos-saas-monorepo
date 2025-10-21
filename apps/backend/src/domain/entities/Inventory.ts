import { BusinessError, ErrorCodes } from '@/domain/errors'
import { Money } from '@/domain/value-objects/Money'

/**
 * Inventory Entity
 * Representa el inventario de un producto en un outlet específico
 */
export class Inventory {
  constructor(
    public readonly id: string,
    public readonly productId: string,
    public readonly outletId: string,
    private _quantity: number,
    private _minStock: number = 0,
    public readonly tenantId: string = ''
  ) {
    this.validate()
  }

  // Getters
  get quantity(): number {
    return this._quantity
  }

  get minStock(): number {
    return this._minStock
  }

  // Business Logic Methods

  /**
   * Valida el inventario
   */
  private validate(): void {
    if (this._quantity < 0) {
      throw new BusinessError(
        ErrorCodes.BUSINESS_INVALID_OPERATION,
        'La cantidad en inventario no puede ser negativa'
      )
    }

    if (this._minStock < 0) {
      throw new BusinessError(
        ErrorCodes.BUSINESS_INVALID_OPERATION,
        'El stock mínimo no puede ser negativo'
      )
    }
  }

  /**
   * Agrega cantidad al inventario
   */
  addStock(quantity: number, reason?: string): void {

    //TODO: usar reason
    reason = reason || 'Sin motivo'
    
    if (quantity <= 0) {
      throw new BusinessError(
        ErrorCodes.VALIDATION_INVALID_INPUT,
        'La cantidad a agregar debe ser mayor a cero'
      )
    }

    this._quantity += quantity
  }

  /**
   * Reduce cantidad del inventario
   */
  subtractStock(quantity: number, reason?: string): void {
    //TODO: usar reason
    reason = reason || 'Sin motivo'
    if (quantity <= 0) {
      throw new BusinessError(
        ErrorCodes.VALIDATION_INVALID_INPUT,
        'La cantidad a restar debe ser mayor a cero'
      )
    }

    const newQuantity = this._quantity - quantity
    if (newQuantity < 0) {
      throw new BusinessError(
        ErrorCodes.BUSINESS_INSUFFICIENT_STOCK,
        `Stock insuficiente. Disponible: ${this._quantity}, Requerido: ${quantity}`
      )
    }

    this._quantity = newQuantity
  }

  /**
   * Establece una cantidad exacta en el inventario
   */
  setStock(quantity: number, reason?: string): void {
    //TODO: usar reason
    reason = reason || 'Sin motivo'
    if (quantity < 0) {
      throw new BusinessError(
        ErrorCodes.VALIDATION_INVALID_INPUT,
        'La cantidad no puede ser negativa'
      )
    }

    this._quantity = quantity
  }

  /**
   * Actualiza el stock mínimo
   */
  updateMinStock(minStock: number): void {
    if (minStock < 0) {
      throw new BusinessError(
        ErrorCodes.VALIDATION_INVALID_INPUT,
        'El stock mínimo no puede ser negativo'
      )
    }

    this._minStock = minStock
  }

  /**
   * Actualiza el stock mediante un cambio (positivo o negativo)
   */
  updateStock(quantityChange: number, reason?: string): void {
    if (quantityChange === 0) {
      throw new BusinessError(
        ErrorCodes.VALIDATION_INVALID_INPUT,
        'El cambio de cantidad no puede ser cero'
      )
    }

    if (quantityChange > 0) {
      this.addStock(quantityChange, reason)
    } else {
      this.subtractStock(Math.abs(quantityChange), reason)
    }
  }

  /**
   * Verifica si hay stock disponible
   */
  hasStock(quantity: number = 1): boolean {
    return this._quantity >= quantity
  }

  /**
   * Verifica si el stock está bajo el mínimo
   */
  isLowStock(): boolean {
    return this._quantity <= this._minStock
  }

  /**
   * Verifica si el stock está agotado
   */
  isOutOfStock(): boolean {
    return this._quantity === 0
  }

  /**
   * Calcula el porcentaje de stock disponible vs mínimo
   */
  getStockPercentage(): number {
    if (this._minStock === 0) return 100
    return (this._quantity / this._minStock) * 100
  }

  /**
   * Calcula cuántas unidades faltan para alcanzar el stock mínimo
   */
  getStockDeficit(): number {
    const deficit = this._minStock - this._quantity
    return deficit > 0 ? deficit : 0
  }

  /**
   * Transfiere stock a otro inventario
   */
  transferTo(targetInventory: Inventory, quantity: number): void {
    if (quantity <= 0) {
      throw new BusinessError(
        ErrorCodes.VALIDATION_INVALID_INPUT,
        'La cantidad a transferir debe ser mayor a cero'
      )
    }

    if (this.productId !== targetInventory.productId) {
      throw new BusinessError(
        ErrorCodes.BUSINESS_INVALID_OPERATION,
        'Solo se puede transferir entre inventarios del mismo producto'
      )
    }

    if (this.outletId === targetInventory.outletId) {
      throw new BusinessError(
        ErrorCodes.BUSINESS_INVALID_OPERATION,
        'No se puede transferir al mismo outlet'
      )
    }

    // Restar del origen
    this.subtractStock(quantity, 'transfer_out')

    // Agregar al destino
    targetInventory.addStock(quantity, 'transfer_in')
  }

  /**
   * Verifica si se puede realizar una venta con la cantidad solicitada
   */
  canSell(quantity: number): { canSell: boolean; message?: string } {
    if (quantity <= 0) {
      return {
        canSell: false,
        message: 'La cantidad debe ser mayor a cero',
      }
    }

    if (!this.hasStock(quantity)) {
      return {
        canSell: false,
        message: `Stock insuficiente. Disponible: ${this._quantity}, Requerido: ${quantity}`,
      }
    }

    return { canSell: true }
  }

  /**
   * Calcula el valor total del inventario dado un precio unitario
   */
  calculateInventoryValue(unitPrice: Money): Money {
    return unitPrice.multiply(this._quantity)
  }

  /**
   * Factory method para crear un nuevo inventario
   */
  static create(
    id: string,
    tenantId: string,
    productId: string,
    outletId: string,
    initialQuantity: number = 0,
    minStock: number = 0
  ): Inventory {
    return new Inventory(id, productId, outletId, initialQuantity, minStock, tenantId)
  }

  /**
   * Factory method para reconstruir desde la base de datos
   */
  static fromPersistence(data: {
    id: string
    productId: string
    outletId: string
    quantity: number
    minStock: number
    tenantId: string
  }): Inventory {
    return new Inventory(
      data.id,
      data.productId,
      data.outletId,
      data.quantity,
      data.minStock,
      data.tenantId
    )
  }

  /**
   * Convierte el inventario a formato para persistencia
   */
  toPersistence() {
    return {
      id: this.id,
      productId: this.productId,
      outletId: this.outletId,
      quantity: this._quantity,
      minStock: this._minStock,
      tenantId: this.tenantId,
    }
  }
}
