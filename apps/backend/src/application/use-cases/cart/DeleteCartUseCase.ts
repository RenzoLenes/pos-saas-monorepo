import { ICartRepository } from '@/domain/repositories/ICartRepository'
import { BusinessError, ErrorCodes } from '@/domain/errors'

interface DeleteCartInput {
  cartId: string
}

/**
 * Delete Cart Use Case
 * Deletes a cart permanently
 */
export class DeleteCartUseCase {
  constructor(private cartRepository: ICartRepository) {}

  async execute(input: DeleteCartInput): Promise<void> {
    // Verify cart exists
    const cart = await this.cartRepository.findById(input.cartId)

    if (!cart) {
      throw new BusinessError('Carrito no encontrado', ErrorCodes.RESOURCE_NOT_FOUND)
    }

    // Delete cart
    await this.cartRepository.delete(input.cartId)
  }
}
