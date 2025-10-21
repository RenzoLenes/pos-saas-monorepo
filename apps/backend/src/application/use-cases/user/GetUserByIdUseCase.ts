import type { IUserRepository, UserWithStats } from '@/domain/repositories'
import { NotFoundError } from '@/domain/errors'

/**
 * Get User By ID Use Case
 * Retrieves user by ID with outlet and stats
 */
export class GetUserByIdUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(id: string, tenantId: string): Promise<UserWithStats> {
    const user = await this.userRepository.findById(id, tenantId)

    if (!user) {
      throw new NotFoundError('User')
    }

    return user
  }
}
