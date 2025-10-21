import type { CartWithItems, ICartRepository } from '@/domain/repositories'
import { NotFoundError } from '@/domain/errors'

export class GetCartByIdUseCase {
  constructor(private readonly cartRepository: ICartRepository) {}

  async execute(cartId: string): Promise<CartWithItems> {
    const cart = await this.cartRepository.findById(cartId)

    if (!cart) {
      throw new NotFoundError('Carrito')
    }

    return cart
  }
}
