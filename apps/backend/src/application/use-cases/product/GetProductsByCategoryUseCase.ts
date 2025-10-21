import type { IProductRepository } from '@/domain/repositories'

export interface GetProductsByCategoryInput {
  categoryId: string
  tenantId: string
  includeInactive?: boolean
}

/**
 * Get Products By Category Use Case
 * Retrieves products filtered by category
 */
export class GetProductsByCategoryUseCase {
  constructor(private productRepository: IProductRepository) {}

  async execute(input: GetProductsByCategoryInput) {
    const where: any = {
      categoryId: input.categoryId,
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
