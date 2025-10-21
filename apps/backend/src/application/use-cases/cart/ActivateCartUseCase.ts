import { ICartRepository } from '@/domain/repositories/ICartRepository'
import { BusinessError, ErrorCodes } from '@/domain/errors'

interface ActivateCartInput {
  cartId: string
}

/**
 * Activate Cart Use Case
 * Activates a held cart for continued use
 */
export class ActivateCartUseCase {
  constructor(private cartRepository: ICartRepository) {}

  async execute(input: ActivateCartInput) {
    // Get cart
    const cart = await this.cartRepository.findById(input.cartId)

    if (!cart) {
      throw new BusinessError('Carrito no encontrado', ErrorCodes.RESOURCE_NOT_FOUND)
    }

    if (cart.status !== 'hold') {
      throw new BusinessError(
        'Solo los carritos en hold pueden ser activados',
        ErrorCodes.VALIDATION_INVALID_STATUS
      )
    }

    // Activate
    return await this.cartRepository.updateCart(input.cartId, {
      status: 'active',
      syncStatus: 'synced',
    })
  }
}
