import type { ICategoryRepository } from '@/domain/repositories'
import type { Category, Prisma } from '@prisma/client'
import { NotFoundError } from '@/domain/errors'

/**
 * Update Category Use Case
 * Updates an existing category
 */
export class UpdateCategoryUseCase {
  constructor(
    private readonly categoryRepository: ICategoryRepository
  ) {}

  async execute(
    categoryId: string,
    tenantId: string,
    data: Prisma.CategoryUpdateInput
  ): Promise<Category> {
    // Verify category exists
    const existing = await this.categoryRepository.getCategoryById(categoryId, tenantId)

    if (!existing) {
      throw new NotFoundError('Categoría', { categoryId })
    }

    return await this.categoryRepository.updateCategory(categoryId, data)
  }
}
