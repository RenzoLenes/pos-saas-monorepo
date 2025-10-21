import type { ISaleRepository, SaleWithItems } from '@/domain/repositories'
import { NotFoundError } from '@/domain/errors'

/**
 * Get Sale by ID Use Case
 * Retrieves a sale with its items by ID
 */
export class GetSaleByIdUseCase {
  constructor(
    private readonly saleRepository: ISaleRepository
  ) {}

  async execute(saleId: string): Promise<SaleWithItems> {
    const sale = await this.saleRepository.findById(saleId)

    if (!sale) {
      throw new NotFoundError('Venta', { saleId })
    }

    return sale
  }
}
