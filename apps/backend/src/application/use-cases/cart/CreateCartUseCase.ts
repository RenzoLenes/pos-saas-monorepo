import type { ICartRepository, CartWithItems } from '@/domain/repositories'

/**
 * Get or Create Cart Use Case
 * Returns the active cart for a user at an outlet, or creates one if it doesn't exist
 */

interface CreateCartInput {
  userId: string
  outletId: string
  name?: string | null
  customerId?: string | null 
}

export class CreateCartUseCase {
  constructor(
    private readonly cartRepository: ICartRepository
  ) {}

  async execute(input: CreateCartInput): Promise<CartWithItems> {
    const { userId, outletId, customerId, name } = input

      const newCart = await this.cartRepository.createCart({
        userId,
        customerId,
        name,
        outletId,
      })


    if (!newCart) {
      throw new Error('Error al crear carrito')
    }

    return {
      ...newCart,
      items: [],
    }
  }
}
