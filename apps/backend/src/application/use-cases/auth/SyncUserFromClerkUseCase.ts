import type { IUserRepository } from '@/domain/repositories'
import { logger } from '@infrastructure/logger/logger'

export interface SyncUserData {
  clerkId: string
  email?: string
  firstName?: string
  lastName?: string
}

export type SyncAction = 'update' | 'delete'

/**
 * Sync User From Clerk Use Case
 * Handles user updates and soft deletes from Clerk webhooks
 */
export class SyncUserFromClerkUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(action: SyncAction, data: SyncUserData): Promise<void> {
    // Find user by clerkId
    const user = await this.userRepository.findByClerkId(data.clerkId)

    if (!user) {
      logger.warn(`User not found for ${action}: ${data.clerkId}`)
      return
    }

    if (action === 'update') {
      // Update user information
      await this.userRepository.updateByClerkId(data.clerkId, {
        email: data.email || user.email,
        firstName: data.firstName || user.firstName,
        lastName: data.lastName || user.lastName,
      })

      logger.info(`User updated: ${data.clerkId}`)
    } else if (action === 'delete') {
      // Soft delete: set status to inactive
      await this.userRepository.updateByClerkId(data.clerkId, {
        status: 'inactive',
      })

      logger.info(`User soft deleted: ${data.clerkId}`)
    }
  }
}
