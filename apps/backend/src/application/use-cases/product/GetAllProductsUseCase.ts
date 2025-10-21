import { IProductRepository } from '@/domain/repositories/IProductRepository'

interface GetAllProductsInput {
  tenantId: string
  includeInactive?: boolean
}

/**
 * Get All Products Use Case
 * Retrieves all products for a tenant
 */
export class GetAllProductsUseCase {
  constructor(private productRepository: IProductRepository) {}

  async execute(input: GetAllProductsInput) {
    const where: any = {
      tenantId: input.tenantId,
    }

    if (!input.includeInactive) {
      where.isActive = true
    }

    return await this.productRepository.findMany({
      where,
      orderBy: { name: 'asc' },
    })
  }
}
