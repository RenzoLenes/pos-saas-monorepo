import { BusinessError, ErrorCodes } from '@/domain/errors'
import { Money } from '@/domain/value-objects/Money'
import { Discount } from '@/domain/value-objects/Discount'

/**
 * Cart Item
 * Representa un ítem dentro del carrito
 */
export class CartItem {
  constructor(
    public readonly productId: string,
    public readonly productName: string,
    public readonly unitPrice: Money,
    public quantity: number,
    public readonly isCustomProduct: boolean = false
  ) {
    if (quantity <= 0) {
      throw new BusinessError(
        ErrorCodes.VALIDATION_INVALID_INPUT,
        'La cantidad debe ser mayor a cero'
      )
    }
  }

  getTotalPrice(): Money {
    return this.unitPrice.multiply(this.quantity)
  }

  updateQuantity(newQuantity: number): void {
    if (newQuantity <= 0) {
      throw new BusinessError(
        ErrorCodes.VALIDATION_INVALID_INPUT,
        'La cantidad debe ser mayor a cero'
      )
    }
    this.quantity = newQuantity
  }

  increaseQuantity(amount: number = 1): void {
    this.quantity += amount
  }

  decreaseQuantity(amount: number = 1): void {
    const newQuantity = this.quantity - amount
    if (newQuantity <= 0) {
      throw new BusinessError(
        ErrorCodes.BUSINESS_INVALID_OPERATION,
        'No se puede reducir la cantidad a cero o menos. Elimine el ítem del carrito.'
      )
    }
    this.quantity = newQuantity
  }
}

/**
 * Cart Entity
 * Representa el carrito de compras con toda su lógica de negocio
 */
export class Cart {
  private items: Map<string, CartItem> = new Map()
  private _discount: Discount = Discount.none()
  private _customerId?: string
  private _name?: string
  private _status: 'active' | 'hold' | 'completed' | 'abandoned' = 'active'
  public readonly tenantId: string = ''

  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly outletId: string,
    tenantId: string = '',
    status: 'active' | 'hold' | 'completed' | 'abandoned' = 'active'
  ) {
    this.tenantId = tenantId
    this._status = status
  }

  // Getters
  get itemsArray(): CartItem[] {
    return Array.from(this.items.values())
  }

  get itemCount(): number {
    return this.items.size
  }

  get totalItems(): number {
    return this.itemsArray.reduce((sum, item) => sum + item.quantity, 0)
  }

  get discount(): Discount {
    return this._discount
  }

  get customerId(): string | undefined {
    return this._customerId
  }

  get name(): string | undefined {
    return this._name
  }

  get status(): 'active' | 'hold' | 'completed' | 'abandoned' {
    return this._status
  }

  // Business Logic Methods

  /**
   * Agrega un ítem al carrito
   */
  addItem(
    productId: string,
    productName: string,
    unitPrice: number,
    quantity: number = 1,
    isCustomProduct: boolean = false
  ): void {
    if (this.status !== 'active') {
      throw new BusinessError(
        ErrorCodes.BUSINESS_INVALID_OPERATION,
        `No se pueden agregar ítems a un carrito en estado: ${this.status}`
      )
    }

    const money = Money.from(unitPrice)
    const existingItem = this.items.get(productId)

    if (existingItem) {
      existingItem.increaseQuantity(quantity)
    } else {
      const newItem = new CartItem(productId, productName, money, quantity, isCustomProduct)
      this.items.set(productId, newItem)
    }
  }

  /**
   * Elimina un ítem del carrito
   */
  removeItem(productId: string): void {
    if (this.status !== 'active') {
      throw new BusinessError(
        ErrorCodes.BUSINESS_INVALID_OPERATION,
        `No se pueden eliminar ítems de un carrito en estado: ${this.status}`
      )
    }

    if (!this.items.has(productId)) {
      throw new BusinessError(
        ErrorCodes.BUSINESS_INVALID_OPERATION,
        'El producto no existe en el carrito'
      )
    }

    this.items.delete(productId)
  }

  /**
   * Actualiza la cantidad de un ítem
   */
  updateItemQuantity(productId: string, quantity: number): void {
    if (this.status !== 'active') {
      throw new BusinessError(
        ErrorCodes.BUSINESS_INVALID_OPERATION,
        `No se puede actualizar un carrito en estado: ${this.status}`
      )
    }

    const item = this.items.get(productId)
    if (!item) {
      throw new BusinessError(
        ErrorCodes.BUSINESS_INVALID_OPERATION,
        'El producto no existe en el carrito'
      )
    }

    item.updateQuantity(quantity)
  }

  /**
   * Aplica un descuento al carrito
   */
  applyDiscount(discountPercentage: number): void {
    if (this.status !== 'active') {
      throw new BusinessError(
        ErrorCodes.BUSINESS_INVALID_OPERATION,
        `No se puede aplicar descuento a un carrito en estado: ${this.status}`
      )
    }

    this._discount = Discount.fromPercentage(discountPercentage)
  }

  /**
   * Remueve el descuento del carrito
   */
  removeDiscount(): void {
    this._discount = Discount.none()
  }

  /**
   * Asigna un cliente al carrito
   */
  assignCustomer(customerId?: string): void {
    this._customerId = customerId
  }

  /**
   * Remueve el cliente del carrito
   */
  removeCustomer(): void {
    this._customerId = undefined
  }

  /**
   * Asigna un nombre al carrito
   */
  setName(name: string): void {
    this._name = name
  }

  /**
   * Limpia todos los ítems del carrito
   */
  clear(): void {
    if (this.status !== 'active') {
      throw new BusinessError(
        ErrorCodes.BUSINESS_INVALID_OPERATION,
        `No se puede limpiar un carrito en estado: ${this.status}`
      )
    }

    this.items.clear()
    this._discount = Discount.none()
  }

  /**
   * Pone el carrito en hold
   */
  hold(name: string): void {
    if (this._status !== 'active') {
      throw new BusinessError(
        ErrorCodes.BUSINESS_INVALID_OPERATION,
        'Solo los carritos activos pueden ser puestos en hold'
      )
    }

    if (this.items.size === 0) {
      throw new BusinessError(
        ErrorCodes.BUSINESS_CART_EMPTY,
        'No se puede poner en hold un carrito vacío'
      )
    }

    this._status = 'hold'
    this._name = name
  }

  /**
   * Activa un carrito en hold
   */
  activate(): void {
    if (this._status !== 'hold') {
      throw new BusinessError(
        ErrorCodes.BUSINESS_INVALID_OPERATION,
        'Solo los carritos en hold pueden ser activados'
      )
    }

    this._status = 'active'
  }

  /**
   * Verifica si el carrito está vacío
   */
  isEmpty(): boolean {
    return this.items.size === 0
  }

  /**
   * Calcula el subtotal (sin descuento)
   */
  calculateSubtotal(): Money {
    return this.itemsArray.reduce(
      (total, item) => total.add(item.getTotalPrice()),
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
   * Calcula el total (con descuento aplicado)
   */
  calculateTotal(): Money {
    const subtotal = this.calculateSubtotal()
    const discountAmount = this.calculateDiscountAmount()
    return subtotal.subtract(discountAmount)
  }

  /**
   * Valida que el carrito pueda ser completado
   */
  validateForCheckout(): void {
    if (this.isEmpty()) {
      throw new BusinessError(
        ErrorCodes.BUSINESS_CART_EMPTY,
        'El carrito está vacío'
      )
    }

    if (this.status !== 'active') {
      throw new BusinessError(
        ErrorCodes.BUSINESS_INVALID_OPERATION,
        'Solo los carritos activos pueden ser completados'
      )
    }

    const total = this.calculateTotal()
    if (total.isNegativeOrZero()) {
      throw new BusinessError(
        ErrorCodes.BUSINESS_INVALID_OPERATION,
        'El total del carrito debe ser mayor a cero'
      )
    }
  }

  /**
   * Obtiene un ítem específico
   */
  getItem(productId: string): CartItem | undefined {
    return this.items.get(productId)
  }

  /**
   * Verifica si el carrito tiene un producto
   */
  hasProduct(productId: string): boolean {
    return this.items.has(productId)
  }

  /**
   * Factory method para crear un carrito nuevo
   */
  static create(
    id: string,
    tenantId: string,
    userId: string,
    outletId: string,
    name?: string,
    customerId?: string
  ): Cart {
    const cart = new Cart(id, userId, outletId, tenantId, 'active')
    if (name) cart._name = name
    if (customerId) cart._customerId = customerId
    return cart
  }

  /**
   * Factory method para crear un carrito vacío
   */
  static createEmpty(id: string, userId: string, outletId: string, tenantId: string = ''): Cart {
    return new Cart(id, userId, outletId, tenantId, 'active')
  }

  /**
   * Factory method para reconstruir un carrito desde la base de datos
   */
  static fromPersistence(data: {
    id: string
    userId: string
    outletId: string
    tenantId: string
    status: 'active' | 'hold' | 'completed' | 'abandoned'
    customerId?: string
    name?: string
    discount: number
    items: Array<{
      productId: string
      productName: string
      unitPrice: number
      quantity: number
      isCustomProduct: boolean
    }>
  }): Cart {
    const cart = new Cart(data.id, data.userId, data.outletId, data.tenantId, data.status)

    cart._customerId = data.customerId
    cart._name = data.name

    if (data.discount > 0) {
      cart._discount = Discount.fromPercentage(data.discount)
    }

    data.items.forEach((item) => {
      const cartItem = new CartItem(
        item.productId,
        item.productName,
        Money.from(item.unitPrice),
        item.quantity,
        item.isCustomProduct
      )
      cart.items.set(item.productId, cartItem)
    })

    return cart
  }

  /**
   * Convierte el carrito a formato para persistencia
   */
  toPersistence() {
    return {
      id: this.id,
      userId: this.userId,
      outletId: this.outletId,
      status: this.status,
      customerId: this._customerId,
      name: this._name,
      subtotal: this.calculateSubtotal().getValue(),
      discount: this._discount.getPercentage(),
      total: this.calculateTotal().getValue(),
      items: this.itemsArray.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice.getValue(),
        totalPrice: item.getTotalPrice().getValue(),
        isCustomProduct: item.isCustomProduct,
      })),
    }
  }
}
