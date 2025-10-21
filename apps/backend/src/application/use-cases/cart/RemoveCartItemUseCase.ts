import type { ICartRepository } from '@/domain/repositories'
import { NotFoundError } from '@/domain/errors'
import { Money } from '@/domain/value-objects'

export interface RemoveCartItemInput {
  itemId: string
}

/**
 * Remove Cart Item Use Case
 * Removes an item from the cart
 */
export class RemoveCartItemUseCase {
  constructor(
    private readonly cartRepository: ICartRepository
  ) {}

  async execute(input: RemoveCartItemInput): Promise<void> {
    const { itemId } = input

    // Get item to find cartId
    const item = await this.cartRepository.getItemById(itemId)
    if (!item) {
      throw new NotFoundError('Item en carrito', { itemId })
    }

    const cartId = item.cartId

    // Delete item
    await this.cartRepository.deleteItem(itemId)

    // Update cart totals
    await this.updateCartTotals(cartId)
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
