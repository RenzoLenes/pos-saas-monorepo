import type { ICategoryRepository } from '@/domain/repositories'
import type { Category } from '@prisma/client'
import { NotFoundError } from '@/domain/errors'

/**
 * Get Category by ID Use Case
 * Retrieves a category by its ID
 */
export class GetCategoryByIdUseCase {
  constructor(
    private readonly categoryRepository: ICategoryRepository
  ) {}

  async execute(categoryId: string, tenantId: string): Promise<Category> {
    const category = await this.categoryRepository.getCategoryById(categoryId, tenantId)

    if (!category) {
      throw new NotFoundError('Categoría', { categoryId })
    }

    return category
  }
}
