import type { IUserRepository, UserWithTenantAndOutlet } from '@/domain/repositories'
import { NotFoundError } from '@/domain/errors'

/**
 * Get Current User Use Case
 * Retrieves the current authenticated user with tenant and outlet information
 */
export class GetCurrentUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(userId: string): Promise<UserWithTenantAndOutlet> {
    const user = await this.userRepository.findByIdWithTenantAndOutlet(userId)

    if (!user) {
      throw new NotFoundError('User')
    }

    return user
  }
}
