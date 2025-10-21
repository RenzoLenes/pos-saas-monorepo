import { ICartRepository } from '@/domain/repositories/ICartRepository'
import { BusinessError, ErrorCodes } from '@/domain/errors'

interface HoldCartInput {
  cartId: string
  name: string
}

/**
 * Hold Cart Use Case
 * Puts a cart on hold with a name for later retrieval
 */
export class HoldCartUseCase {
  constructor(private cartRepository: ICartRepository) {}

  async execute(input: HoldCartInput) {
    // Get cart
    const cart = await this.cartRepository.findById(input.cartId)

    if (!cart) {
      throw new BusinessError('Carrito no encontrado', ErrorCodes.RESOURCE_NOT_FOUND)
    }

    if (cart.status !== 'active') {
      throw new BusinessError(
        'Solo los carritos activos pueden ser puestos en hold',
        ErrorCodes.VALIDATION_INVALID_STATUS
      )
    }

    if (cart.items.length === 0) {
      throw new BusinessError(
        'No se puede poner en hold un carrito vacío',
        ErrorCodes.VALIDATION_FAILED
      )
    }

    // Put on hold
    return await this.cartRepository.updateCart(input.cartId, {
      status: 'hold',
      name: input.name,
      syncStatus: 'synced',
    })
  }
}
