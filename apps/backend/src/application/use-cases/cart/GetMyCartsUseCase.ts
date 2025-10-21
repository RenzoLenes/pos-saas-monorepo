import { ICartRepository } from '@/domain/repositories/ICartRepository'

interface GetMyCartsInput {
  userId: string
  outletId: string
}

/**
 * Get My Carts Use Case
 * Retrieves all active and held carts for a specific user in an outlet
 */
export class GetMyCartsUseCase {
  constructor(private cartRepository: ICartRepository) {}

  async execute(input: GetMyCartsInput) {
    return await this.cartRepository.findByUserAndOutlet(
      input.userId,
      input.outletId,
      ['active', 'hold']
    )
  }
}
