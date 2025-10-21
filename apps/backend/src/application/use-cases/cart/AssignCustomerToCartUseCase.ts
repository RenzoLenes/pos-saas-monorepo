import { ICartRepository } from '@/domain/repositories/ICartRepository'
import { BusinessError, ErrorCodes } from '@/domain/errors'

interface AssignCustomerInput {
  cartId: string
  customerId?: string | null
}

/**
 * Assign Customer To Cart Use Case
 * Assigns or removes a customer from a cart
 */
export class AssignCustomerToCartUseCase {
  constructor(private cartRepository: ICartRepository) {}

  async execute(input: AssignCustomerInput) {
    // Get cart
    const cart = await this.cartRepository.findById(input.cartId)

    if (!cart) {
      throw new BusinessError('Carrito no encontrado', ErrorCodes.RESOURCE_NOT_FOUND)
    }

    // Update customer assignment
    return await this.cartRepository.updateCart(input.cartId, {
      customer: input.customerId ? { connect: { id: input.customerId } } : { disconnect: true },
      syncStatus: 'synced',
    })
  }
}
