import { prisma } from '@infrastructure/database/prisma'
import { logger } from '@infrastructure/logger/logger'

interface ClerkUserData {
  id: string
  email_addresses: Array<{
    id: string
    email_address: string
  }>
  primary_email_address_id: string
  first_name?: string
  last_name?: string
  public_metadata?: {
    tenantId?: string
    role?: string
    outletId?: string
  }
}

export class ProcessInvitedUserUseCase {
  async execute(clerkUserData: ClerkUserData): Promise<void> {
    const clerkId = clerkUserData.id
    const primaryEmail = clerkUserData.email_addresses.find(
      (e) => e.id === clerkUserData.primary_email_address_id
    )
    const email = primaryEmail?.email_address

    if (!email) {
      throw new Error('No email found in Clerk user data')
    }

    //const metadata = clerkUserData.public_metadata || {}

    logger.info(`Processing invited user: ${email}`)

    // Find pending user by email
    const pendingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (!pendingUser) {
      logger.error(`No pending user found for: ${email}`)
      return
    }

    if (pendingUser.status === 'active') {
      logger.info(`User already active: ${email}`)
      return
    }

    // Update user with Clerk ID and activate
    await prisma.user.update({
      where: { email },
      data: {
        clerkId,
        firstName: clerkUserData.first_name || pendingUser.firstName || 'User',
        lastName: clerkUserData.last_name || pendingUser.lastName || 'Name',
        status: 'active',
        invitationStatus: 'accepted',
        // Metadata from invitation already set when creating pending user
      },
    })

    logger.info(`Activated invited user: ${pendingUser.id}`)
  }
}
