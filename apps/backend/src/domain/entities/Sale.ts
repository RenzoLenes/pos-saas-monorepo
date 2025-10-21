import { BusinessError, ErrorCodes } from '@/domain/errors'
import { Money } from '@/domain/value-objects/Money'
import { Discount } from '@/domain/value-objects/Discount'
import { SaleNumber } from '@/domain/value-objects/SaleNumber'

/**
 * Sale Item
 * Representa un ítem dentro de una venta
 */
export class SaleItem {
  constructor(
    public readonly productId: string,
    public readonly productName: string,
    public readonly quantity: number,
    public readonly unitPrice: Money,
    public readonly totalPrice: Money
  ) {
    if (quantity <= 0) {
      throw new BusinessError(
        ErrorCodes.VALIDATION_INVALID_INPUT,
        'La cantidad debe ser mayor a cero'
      )
    }

    if (unitPrice.isNegativeOrZero()) {
      throw new BusinessError(
        ErrorCodes.VALIDATION_INVALID_INPUT,
        'El precio unitario debe ser mayor a cero'
      )
    }
  }

  static create(productId: string, productName: string, quantity: number, unitPrice: number): SaleItem {
    const unitPriceMoney = Money.from(unitPrice)
    const totalPrice = unitPriceMoney.multiply(quantity)

    return new SaleItem(productId, productName, quantity, unitPriceMoney, totalPrice)
  }
}

/**
 * Payment Information
 */
export class Payment {
  constructor(
    public readonly method: 'cash' | 'card' | 'mixed',
    public readonly cashReceived?: Money,
    public readonly cardAmount?: Money,
    public readonly change?: Money
  ) {
    if (method === 'cash' && !cashReceived) {
      throw new BusinessError(
        ErrorCodes.BUSINESS_INVALID_PAYMENT,
        'El pago en efectivo requiere el monto recibido'
      )
    }

    if (method === 'mixed' && (!cashReceived || !cardAmount)) {
      throw new BusinessError(
        ErrorCodes.BUSINESS_INVALID_PAYMENT,
        'El pago mixto requiere montos de efectivo y tarjeta'
      )
    }
  }

  static cash(received: number, change: number): Payment {
    return new Payment(
      'cash',
      Money.from(received),
      undefined,
      Money.from(change)
    )
  }

  static card(): Payment {
    return new Payment('card')
  }

  static mixed(cashAmount: number, cardAmount: number, change?: number): Payment {
    return new Payment(
      'mixed',
      Money.from(cashAmount),
      Money.from(cardAmount),
      change ? Money.from(change) : undefined
    )
  }

  /**
   * Calcula el cambio para un pago en efectivo
   */
  static calculateChange(cashReceived: Money, total: Money): Money {
    if (cashReceived.isLessThan(total)) {
      throw new BusinessError(
        ErrorCodes.BUSINESS_INVALID_PAYMENT,
        'El efectivo recibido es insuficiente'
      )
    }
    return cashReceived.subtract(total)
  }

  /**
   * Valida que el pago sea suficiente para cubrir el total
   */
  validatePayment(total: Money): void {
    if (this.method === 'cash' && this.cashReceived) {
      if (this.cashReceived.isLessThan(total)) {
        throw new BusinessError(
          ErrorCodes.BUSINESS_INVALID_PAYMENT,
          `Efectivo insuficiente. Recibido: ${this.cashReceived.getValue()}, Requerido: ${total.getValue()}`
        )
      }
    }

    if (this.method === 'mixed' && this.cashReceived && this.cardAmount) {
      const totalPaid = this.cashReceived.add(this.cardAmount)
      if (totalPaid.isLessThan(total)) {
        throw new BusinessError(
          ErrorCodes.BUSINESS_INVALID_PAYMENT,
          'El pago mixto es insuficiente para cubrir el total'
        )
      }
    }
  }
}

/**
 * Sale Entity
 * Representa una venta completada con toda su lógica de negocio
 */
export class Sale {
  private _items: SaleItem[] = []
  private _discount: Discount
  private _payment: Payment
  private _customerId?: string
  private readonly _saleNumber: SaleNumber
  private readonly _createdAt: Date

  constructor(
    public readonly id: string,
    public readonly tenantId: string,
    public readonly outletId: string,
    public readonly userId: string,
    saleNumber: string,
    payment: Payment,
    items: SaleItem[],
    discount: Discount = Discount.none(),
    customerId?: string,
    createdAt: Date = new Date()
  ) {
    if (items.length === 0) {
      throw new BusinessError(
        ErrorCodes.BUSINESS_CART_EMPTY,
        'Una venta debe tener al menos un ítem'
      )
    }

    this._saleNumber = SaleNumber.from(saleNumber)
    this._items = items
    this._discount = discount
    this._payment = payment
    this._customerId = customerId
    this._createdAt = createdAt

    this.validate()
  }

  // Getters
  get items(): ReadonlyArray<SaleItem> {
    return this._items
  }

  get discount(): Discount {
    return this._discount
  }

  get payment(): Payment {
    return this._payment
  }

  get customerId(): string | undefined {
    return this._customerId
  }

  get saleNumber(): string {
    return this._saleNumber.getValue()
  }

  get createdAt(): Date {
    return this._createdAt
  }

  // Business Logic Methods

  /**
   * Calcula el subtotal de la venta
   */
  calculateSubtotal(): Money {
    return this._items.reduce(
      (total, item) => total.add(item.totalPrice),
      Money.zero()
    )
  }

  /**
   * Calcula el monto del descuento
   */
  calculateDiscountAmount(): Money {
    const subtotal = this.calculateSubtotal()
    return this._discount.apply(subtotal)
  }

  /**
   * Calcula el total de la venta
   */
  calculateTotal(): Money {
    const subtotal = this.calculateSubtotal()
    const discountAmount = this.calculateDiscountAmount()
    return subtotal.subtract(discountAmount)
  }

  /**
   * Valida la venta
   */
  private validate(): void {
    const total = this.calculateTotal()

    if (total.isNegativeOrZero()) {
      throw new BusinessError(
        ErrorCodes.BUSINESS_INVALID_OPERATION,
        'El total de la venta debe ser mayor a cero'
      )
    }

    // Validar pago en efectivo
    if (this._payment.method === 'cash' && this._payment.cashReceived) {
      if (this._payment.cashReceived.isLessThan(total)) {
        throw new BusinessError(
          ErrorCodes.BUSINESS_INVALID_PAYMENT,
          'El efectivo recibido es insuficiente'
        )
      }

      const expectedChange = this._payment.cashReceived.subtract(total)
      if (this._payment.change && !this._payment.change.equals(expectedChange)) {
        throw new BusinessError(
          ErrorCodes.BUSINESS_INVALID_PAYMENT,
          'El cambio calculado no coincide'
        )
      }
    }

    // Validar pago mixto
    if (this._payment.method === 'mixed') {
      const cashAmount = this._payment.cashReceived || Money.zero()
      const cardAmount = this._payment.cardAmount || Money.zero()
      const totalPaid = cashAmount.add(cardAmount)

      if (this._payment.change) {
        const totalWithChange = totalPaid.subtract(this._payment.change)
        if (!totalWithChange.equals(total)) {
          throw new BusinessError(
            ErrorCodes.BUSINESS_INVALID_PAYMENT,
            'Los montos del pago mixto no coinciden con el total'
          )
        }
      } else if (!totalPaid.equals(total)) {
        throw new BusinessError(
          ErrorCodes.BUSINESS_INVALID_PAYMENT,
          'Los montos del pago mixto no coinciden con el total'
        )
      }
    }
  }

  /**
   * Verifica si la venta tiene un cliente asignado
   */
  hasCustomer(): boolean {
    return this._customerId !== undefined
  }

  /**
   * Obtiene el método de pago como string
   */
  getPaymentMethod(): 'cash' | 'card' | 'mixed' {
    return this._payment.method
  }

  /**
   * Factory method para crear una venta desde un carrito
   */
  static fromCart(
    id: string,
    tenantId: string,
    outletId: string,
    userId: string,
    saleNumber: string,
    cart: {
      items: Array<{
        productId: string
        productName: string
        quantity: number
        unitPrice: number
      }>
      discount: number
      customerId?: string
    },
    payment: Payment
  ): Sale {
    const items = cart.items.map((item) =>
      SaleItem.create(item.productId, item.productName, item.quantity, item.unitPrice)
    )

    const discount = cart.discount > 0 ? Discount.fromPercentage(cart.discount) : Discount.none()

    return new Sale(
      id,
      tenantId,
      outletId,
      userId,
      saleNumber,
      payment,
      items,
      discount,
      cart.customerId
    )
  }

  /**
   * Factory method para reconstruir una venta desde la base de datos
   */
  static fromPersistence(data: {
    id: string
    tenantId: string
    outletId: string
    userId: string
    saleNumber: string
    discount: number
    customerId?: string
    paymentMethod: 'cash' | 'card' | 'mixed'
    cashReceived?: number
    cardAmount?: number
    change?: number
    createdAt: Date
    items: Array<{
      productId: string
      productName: string
      quantity: number
      unitPrice: number
      totalPrice: number
    }>
  }): Sale {
    const items = data.items.map(
      (item) =>
        new SaleItem(
          item.productId,
          item.productName,
          item.quantity,
          Money.from(item.unitPrice),
          Money.from(item.totalPrice)
        )
    )

    const discount = data.discount > 0 ? Discount.fromPercentage(data.discount) : Discount.none()

    let payment: Payment
    if (data.paymentMethod === 'cash') {
      payment = Payment.cash(data.cashReceived!, data.change || 0)
    } else if (data.paymentMethod === 'card') {
      payment = Payment.card()
    } else {
      payment = Payment.mixed(data.cashReceived!, data.cardAmount!, data.change)
    }

    return new Sale(
      data.id,
      data.tenantId,
      data.outletId,
      data.userId,
      data.saleNumber,
      payment,
      items,
      discount,
      data.customerId,
      data.createdAt
    )
  }

  /**
   * Convierte la venta a formato para persistencia
   */
  toPersistence() {
    return {
      id: this.id,
      tenantId: this.tenantId,
      outletId: this.outletId,
      userId: this.userId,
      saleNumber: this.saleNumber,
      subtotal: this.calculateSubtotal().getValue(),
      discount: this._discount.getPercentage(),
      total: this.calculateTotal().getValue(),
      paymentMethod: this._payment.method,
      cashReceived: this._payment.cashReceived?.getValue(),
      cardAmount: this._payment.cardAmount?.getValue(),
      change: this._payment.change?.getValue(),
      customerId: this._customerId,
      createdAt: this._createdAt,
      items: this._items.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice.getValue(),
        totalPrice: item.totalPrice.getValue(),
      })),
    }
  }
}
