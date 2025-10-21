import type { ICartRepository } from '@/domain/repositories'
import { NotFoundError } from '@/domain/errors'

/**
 * Clear Cart Use Case
 * Removes all items from the cart and resets totals
 */
export class ClearCartUseCase {
  constructor(
    private readonly cartRepository: ICartRepository
  ) {}

  async execute(cartId: string): Promise<void> {
    // Get cart
    const cart = await this.cartRepository.findById(cartId)
    if (!cart) {
      throw new NotFoundError('Carrito', { cartId })
    }

    // Delete all items
    await this.cartRepository.deleteAllItems(cartId)

    // Reset cart totals
    await this.cartRepository.updateCart(cartId, {
      subtotal: 0,
      discount: 0,
      total: 0,
      syncStatus: 'synced',
    })
  }
}
