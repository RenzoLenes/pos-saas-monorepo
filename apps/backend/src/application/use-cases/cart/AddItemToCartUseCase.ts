import type { ICartRepository, IProductRepository } from '@/domain/repositories'
import type { CartItem } from '@prisma/client'
import { NotFoundError, BusinessError, ErrorCodes } from '@/domain/errors'
import { Money } from '@/domain/value-objects'

export interface AddItemInput {
  cartId: string
  productId: string
  quantity: number
}

/**
 * Add Item to Cart Use Case
 * Adds a product to the cart or updates quantity if it already exists
 */
export class AddItemToCartUseCase {
  constructor(
    private readonly cartRepository: ICartRepository,
    private readonly productRepository: IProductRepository
  ) {}

  async execute(input: AddItemInput): Promise<CartItem> {
    const { cartId, productId, quantity } = input

    // Validate quantity
    if (quantity <= 0) {
      throw new BusinessError(
        ErrorCodes.BUSINESS_INVALID_OPERATION,
        'La cantidad debe ser mayor a 0'
      )
    }

    // Get cart
    const cart = await this.cartRepository.findById(cartId)
    if (!cart) {
      throw new NotFoundError('Carrito', { cartId })
    }

    // Get product
    const product = await this.productRepository.findById(productId)
    if (!product) {
      throw new NotFoundError('Producto', { productId })
    }

    // Check if item already exists in cart
    const existingItem = await this.cartRepository.findItem(cartId, productId)

    let cartItem: CartItem

    if (existingItem) {
      // Update existing item
      const newQuantity = existingItem.quantity + quantity
      const unitPrice = Money.from(Number(product.price))
      const totalPrice = unitPrice.multiply(newQuantity)

      cartItem = await this.cartRepository.updateItem(existingItem.id, {
        quantity: newQuantity,
        totalPrice: totalPrice.toNumber(),
      })
    } else {
      // Create new item
      const unitPrice = Money.from(Number(product.price))
      const totalPrice = unitPrice.multiply(quantity)

      cartItem = await this.cartRepository.addItem({
        cartId,
        productId,
        quantity,
        unitPrice: unitPrice.toNumber(),
        totalPrice: totalPrice.toNumber(),
      })
    }

    // Update cart totals
    await this.updateCartTotals(cartId)

    return cartItem
  }

  /**
   * Recalculate and update cart totals
   */
  private async updateCartTotals(cartId: string): Promise<void> {
    const cart = await this.cartRepository.findById(cartId)
    if (!cart) return

    // Calculate subtotal from all items
    const subtotal = cart.items.reduce(
      (sum, item) => sum.add(Money.from(Number(item.totalPrice))),
      Money.zero()
    )

    // Apply discount if exists
    const discountAmount = Money.from(Number(cart.discount))
    const total = subtotal.subtract(discountAmount)

    await this.cartRepository.updateCart(cartId, {
      subtotal: subtotal.toNumber(),
      total: total.toNumber(),
      syncStatus: 'synced',
    })
  }
}
