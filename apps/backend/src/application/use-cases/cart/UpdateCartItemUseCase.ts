import type { ICartRepository } from '@/domain/repositories'
import type { CartItem } from '@prisma/client'
import { NotFoundError, BusinessError, ErrorCodes } from '@/domain/errors'
import { Money } from '@/domain/value-objects'

export interface UpdateCartItemInput {
  itemId: string
  quantity: number
}

/**
 * Update Cart Item Use Case
 * Updates the quantity of an item in the cart
 */
export class UpdateCartItemUseCase {
  constructor(
    private readonly cartRepository: ICartRepository
  ) {}

  async execute(input: UpdateCartItemInput): Promise<CartItem> {
    const { itemId, quantity } = input

    // Validate quantity
    if (quantity <= 0) {
      throw new BusinessError(
        ErrorCodes.BUSINESS_INVALID_OPERATION,
        'La cantidad debe ser mayor a 0'
      )
    }

    // Get item to find cartId
    const item = await this.cartRepository.getItemById(itemId)
    if (!item) {
      throw new NotFoundError('Item en carrito', { itemId })
    }

    const cartId = item.cartId

    // Update item
    const unitPrice = Money.from(Number(item.unitPrice))
    const totalPrice = unitPrice.multiply(quantity)

    const updatedItem = await this.cartRepository.updateItem(itemId, {
      quantity,
      totalPrice: totalPrice.toNumber(),
    })

    // Update cart totals
    await this.updateCartTotals(cartId)

    return updatedItem
  }

  private async updateCartTotals(cartId: string): Promise<void> {
    const cart = await this.cartRepository.findById(cartId)
    if (!cart) return

    const subtotal = cart.items.reduce(
      (sum, item) => sum.add(Money.from(Number(item.totalPrice))),
      Money.zero()
    )

    const discountAmount = Money.from(Number(cart.discount))
    const total = subtotal.subtract(discountAmount)

    await this.cartRepository.updateCart(cartId, {
      subtotal: subtotal.toNumber(),
      total: total.toNumber(),
      syncStatus: 'synced',
    })
  }
}
