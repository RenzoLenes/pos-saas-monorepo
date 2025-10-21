import type { IUserRepository, UserWithOutlet, GetUsersParams } from '@/domain/repositories'

/**
 * Get All Users Use Case
 * Retrieves all users for a tenant with outlet relation
 */
export class GetAllUsersUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(params: GetUsersParams): Promise<UserWithOutlet[]> {
    return await this.userRepository.findAllByTenant(params)
  }
}
