import type { ICategoryRepository } from '@/domain/repositories'
import { NotFoundError } from '@/domain/errors'

/**
 * Delete Category Use Case
 * Deletes a category
 */
export class DeleteCategoryUseCase {
  constructor(
    private readonly categoryRepository: ICategoryRepository
  ) {}

  async execute(categoryId: string, tenantId: string): Promise<void> {
    // Verify category exists
    const existing = await this.categoryRepository.getCategoryById(categoryId, tenantId)

    if (!existing) {
      throw new NotFoundError('Categoría', { categoryId })
    }

    await this.categoryRepository.deleteCategory(categoryId, tenantId)
  }
}
