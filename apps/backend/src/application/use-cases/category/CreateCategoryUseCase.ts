import type { ICategoryRepository } from '@/domain/repositories'
import type { Category } from '@prisma/client'

/**
 * Create Category Use Case
 * Creates a new category
 */
export class CreateCategoryUseCase {
  constructor(
    private readonly categoryRepository: ICategoryRepository
  ) {}

  async execute(data: {
    name: string
    description?: string
    tenantId: string
  }): Promise<Category> {
    return await this.categoryRepository.createCategory(data)
  }
}
