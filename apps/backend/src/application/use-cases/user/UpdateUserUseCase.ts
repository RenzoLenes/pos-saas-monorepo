import type { IUserRepository, UserWithOutlet, UpdateUserInput, IOutletRepository } from '@/domain/repositories'
import { NotFoundError, BusinessError } from '@/domain/errors'

export interface UpdateUserParams {
  id: string
  tenantId: string
  currentUserId: string
  data: UpdateUserInput
}

/**
 * Update User Use Case
 * Updates user with validations:
 * - User exists
 * - Cannot modify own role/status
 * - Outlet exists and belongs to tenant
 */
export class UpdateUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly outletRepository: IOutletRepository
  ) {}

  async execute(params: UpdateUserParams): Promise<UserWithOutlet> {
    // Check if user exists
    const user = await this.userRepository.findById(params.id, params.tenantId)

    if (!user) {
      throw new NotFoundError('User')
    }

    // Prevent users from modifying their own role or status
    if (params.id === params.currentUserId && (params.data.role || params.data.status)) {
      throw new BusinessError('You cannot modify your own role or status')
    }

    // If assigning to an outlet, verify outlet exists and belongs to tenant
    if (params.data.outletId) {
      const outlet = await this.outletRepository.findById(params.data.outletId, params.tenantId)

      if (!outlet) {
        throw new NotFoundError('Outlet')
      }
    }

    return await this.userRepository.update(params.id, params.data)
  }
}
