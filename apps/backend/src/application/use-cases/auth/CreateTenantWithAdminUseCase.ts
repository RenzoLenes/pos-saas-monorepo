import { prisma } from '@infrastructure/database/prisma'
import { clerkService } from '@infrastructure/services/ClerkService'
import { BusinessError } from '@domain/errors/app-error'
import { ErrorCodes } from '@domain/errors/error-codes'
import { logger } from '@infrastructure/logger/logger'

interface CreateTenantParams {
  tenantName: string
  subdomain: string
  adminEmail: string
  adminFirstName: string
  adminLastName: string
}

export class CreateTenantWithAdminUseCase {
  async execute(params: CreateTenantParams): Promise<{ tenantId: string; userId: string }> {
    const { tenantName, subdomain, adminEmail, adminFirstName, adminLastName } = params

    logger.info(`Creating tenant: ${tenantName}`)

    // Validate subdomain is unique
    const existingTenant = await prisma.tenant.findUnique({
      where: { subdomain },
    })

    if (existingTenant) {
      throw new BusinessError(
        ErrorCodes.VALIDATION_ERROR,
        'Subdomain already exists'
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: adminEmail },
    })

    if (existingUser) {
      throw new BusinessError(
        ErrorCodes.VALIDATION_ERROR,
        'User with this email already exists'
      )
    }

    // Create tenant
    const tenant = await prisma.tenant.create({
      data: {
        name: tenantName,
        subdomain,
        plan: 'basic',
        status: 'active',
      },
    })

    logger.info(`Created tenant: ${tenant.id}`)

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

    // Create Clerk invitation
    await clerkService.createInvitation({
      email: adminEmail,
      publicMetadata: {
        tenantId: tenant.id,
        role: 'admin',
        outletId: null,
      },
    })

    // Pre-create user
    const user = await prisma.user.create({
      data: {
        clerkId: '', // Will be filled by webhook
        email: adminEmail,
        firstName: adminFirstName,
        lastName: adminLastName,
        role: 'admin',
        tenantId: tenant.id,
        outletId: null,
        invitationStatus: 'pending',
        invitedAt: new Date(),
        status: 'pending',
      },
    })

    logger.info(`Created pending admin user: ${user.id}`)

    return {
      tenantId: tenant.id,
      userId: user.id,
    }
  }
}
