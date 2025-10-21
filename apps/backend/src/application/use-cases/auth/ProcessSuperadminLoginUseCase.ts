import { prisma } from '@infrastructure/database/prisma'
import { clerkService } from '@infrastructure/services/ClerkService'
import { logger } from '@infrastructure/logger/logger'

interface ClerkUserData {
  id: string // Clerk ID
  email_addresses: Array<{
    id: string
    email_address: string
  }>
  primary_email_address_id: string
  first_name?: string
  last_name?: string
}

export class ProcessSuperadminLoginUseCase {
  async execute(clerkUserData: ClerkUserData): Promise<void> {
    const clerkId = clerkUserData.id
    const primaryEmail = clerkUserData.email_addresses.find(
      (e) => e.id === clerkUserData.primary_email_address_id
    )
    const email = primaryEmail?.email_address

    if (!email) {
      throw new Error('No email found in Clerk user data')
    }

    logger.info(`Processing superadmin login: ${email}`)

    // Check if user already exists
    let user = await prisma.user.findUnique({
      where: { clerkId },
    })

    if (user) {
      // Update existing superadmin
      user = await prisma.user.update({
        where: { clerkId },
        data: {
          email,
          firstName: clerkUserData.first_name || user.firstName,
          lastName: clerkUserData.last_name || user.lastName,
          role: 'superadmin',
          status: 'active',
        },
      })
      logger.info(`Updated existing superadmin: ${user.id}`)
    } else {
      // Create new superadmin
      user = await prisma.user.create({
        data: {
          clerkId,
          email,
          firstName: clerkUserData.first_name || 'Super',
          lastName: clerkUserData.last_name || 'Admin',
          role: 'superadmin',
          status: 'active',
          tenantId: null, // No tenant for superadmin
          outletId: null,
        },
      })
      logger.info(`Created new superadmin: ${user.id}`)
    }

    // Update Clerk metadata
    await clerkService.updateUserMetadata({
      clerkId,
      publicMetadata: {
        role: 'superadmin',
        userId: user.id,
      },
    })

    logger.info(`Superadmin login processed: ${user.id}`)
  }
}
