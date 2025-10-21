import type { ICategoryRepository } from '@/domain/repositories'
import type { Category } from '@prisma/client'

/**
 * Get All Categories Use Case
 * Retrieves all categories for a tenant
 */
export class GetAllCategoriesUseCase {
  constructor(
    private readonly categoryRepository: ICategoryRepository
  ) {}

  async execute(tenantId: string): Promise<Category[]> {
    return await this.categoryRepository.getCategories(tenantId)
  }
}
