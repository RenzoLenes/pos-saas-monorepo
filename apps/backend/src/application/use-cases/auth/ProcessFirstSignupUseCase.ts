import { prisma } from '@infrastructure/database/prisma'
import { clerkService } from '@infrastructure/services/ClerkService'
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
}

export class ProcessFirstSignupUseCase {
  async execute(clerkUserData: ClerkUserData): Promise<void> {
    const clerkId = clerkUserData.id
    const primaryEmail = clerkUserData.email_addresses.find(
      (e) => e.id === clerkUserData.primary_email_address_id
    )
    const email = primaryEmail?.email_address

    if (!email) {
      throw new Error('No email found in Clerk user data')
    }

    logger.info(`Processing first signup for: ${email}`)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { clerkId },
    })

    if (existingUser) {
      logger.info(`User already exists: ${clerkId}`)
      return
    }

    // Generate subdomain from email
    const emailPrefix = email.split('@')[0].toLowerCase()
    const baseSubdomain = emailPrefix.replace(/[^a-z0-9]/g, '')

    // Check subdomain uniqueness
    let subdomain = baseSubdomain
    let counter = 1
    while (await prisma.tenant.findUnique({ where: { subdomain } })) {
      subdomain = `${baseSubdomain}${counter}`
      counter++
    }

    // Create tenant
    const tenant = await prisma.tenant.create({
      data: {
        name: `${clerkUserData.first_name || email}'s Business`,
        subdomain,
        plan: 'basic',
        status: 'active',
      },
    })

    logger.info(`Created tenant: ${tenant.id} (${subdomain})`)

    // Create default outlet
    const outlet = await prisma.outlet.create({
      data: {
        name: 'Main Store',
        tenantId: tenant.id,
        status: 'active',
        currency: 'USD',
        locale: 'en-US',
        timezone: 'UTC',
      },
    })

    logger.info(`Created default outlet: ${outlet.id}`)

    // Create admin user
    const user = await prisma.user.create({
      data: {
        clerkId,
        email,
        firstName: clerkUserData.first_name || 'Admin',
        lastName: clerkUserData.last_name || 'User',
        role: 'admin',
        status: 'active',
        tenantId: tenant.id,
        outletId: null, // Admin has access to all outlets
      },
    })

    logger.info(`Created admin user: ${user.id}`)

    // Update Clerk metadata
    await clerkService.updateUserMetadata({
      clerkId,
      publicMetadata: {
        tenantId: tenant.id,
        role: 'admin',
        userId: user.id,
      },
    })

    logger.info(`First signup completed for: ${email}`)
  }
}
