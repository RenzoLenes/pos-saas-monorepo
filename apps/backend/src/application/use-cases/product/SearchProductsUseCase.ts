import type { IProductRepository } from '@/domain/repositories'
import type { Product, Prisma } from '@prisma/client'

export interface SearchProductsInput {
  tenantId: string
  query?: string
  categoryId?: string
  isActive?: boolean
  limit?: number
  offset?: number
}

/**
 * Search Products Use Case
 * Searches products with filters and pagination
 */
export class SearchProductsUseCase {
  constructor(
    private readonly productRepository: IProductRepository
  ) {}

  async execute(input: SearchProductsInput): Promise<Product[]> {
    const where: Prisma.ProductWhereInput = {
      tenantId: input.tenantId,
    }

    if (input.query) {
      where.OR = [
        { name: { contains: input.query, mode: 'insensitive' } },
        { barcode: { contains: input.query, mode: 'insensitive' } },
        { sku: { contains: input.query, mode: 'insensitive' } },
      ]
    }

    if (input.categoryId) {
      where.categoryId = input.categoryId
    }

    if (input.isActive !== undefined) {
      where.isActive = input.isActive
    }

    return await this.productRepository.findMany({
      where,
      skip: input.offset,
      take: input.limit || 50,
      orderBy: { name: 'asc' },
    })
  }
}
