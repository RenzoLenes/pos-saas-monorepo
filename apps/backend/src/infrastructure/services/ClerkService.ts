import { createClerkClient } from '@clerk/backend'
import { env } from '@infrastructure/config/env'
import { logger } from '@infrastructure/logger/logger'

export const clerkClient = createClerkClient({
  secretKey: env.CLERK_SECRET_KEY!,
})

interface InvitationParams {
  email: string
  publicMetadata: {
    tenantId: string
    role: string
    outletId?: string | null
  }
}

interface UpdateMetadataParams {
  clerkId: string
  publicMetadata: Record<string, any>
}

export class ClerkService {
  /**
   * Create invitation with metadata
   * Metadata automatically transfers to user on signup
   */
  async createInvitation(params: InvitationParams): Promise<any> {
    try {
      const invitation = await clerkClient.invitations.createInvitation({
        emailAddress: params.email,
        publicMetadata: params.publicMetadata,
        redirectUrl: `${env.CORS_ORIGIN}/accept-invitation`,
      })

      logger.info(`Invitation created for ${params.email}`, {
        invitationId: invitation.id,
        metadata: params.publicMetadata,
      })

      return invitation
    } catch (error) {
      logger.error(`Failed to create invitation: ${error}`)
      throw error
    }
  }

  /**
   * Update user public metadata
   */
  async updateUserMetadata(params: UpdateMetadataParams): Promise<void> {
    try {
      await clerkClient.users.updateUser(params.clerkId, {
        publicMetadata: params.publicMetadata,
      })

      logger.info(`Updated metadata for user ${params.clerkId}`, {
        metadata: params.publicMetadata,
      })
    } catch (error) {
      logger.error(`Failed to update user metadata: ${error}`)
      throw error
    }
  }

  /**
   * Delete user from Clerk
   */
  async deleteUser(clerkId: string): Promise<void> {
    try {
      await clerkClient.users.deleteUser(clerkId)
      logger.info(`Deleted Clerk user: ${clerkId}`)
    } catch (error) {
      logger.error(`Failed to delete Clerk user: ${error}`)
      throw error
    }
  }

  /**
   * Check if email is superadmin
   */
  isSuperadminEmail(email: string): boolean {
    if (!env.SUPERADMIN_EMAILS) return false

    const superadminEmails = env.SUPERADMIN_EMAILS
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter((e) => e.length > 0)

    return superadminEmails.includes(email.toLowerCase())
  }
}

// Singleton instance
export const clerkService = new ClerkService()
