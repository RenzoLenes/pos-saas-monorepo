import { prisma } from '@infrastructure/database/prisma'
import { clerkService } from '@infrastructure/services/ClerkService'
import { BusinessError } from '@domain/errors/app-error'
import { ErrorCodes } from '@domain/errors/error-codes'
import { logger } from '@infrastructure/logger/logger'

interface InviteUserParams {
  email: string
  role: 'admin' | 'manager' | 'cashier'
  outletId?: string
  invitedBy: {
    id: string
    role: string
    tenantId: string
  }
}

export class InviteUserUseCase {
  async execute(params: InviteUserParams): Promise<void> {
    const { email, role, outletId, invitedBy } = params

    logger.info(`Processing invitation for ${email} as ${role}`)

    // ========== PERMISSION VALIDATION ==========

    // Superadmin cannot invite (they create tenants directly)
    if (invitedBy.role === 'superadmin') {
      throw new BusinessError(
        ErrorCodes.FORBIDDEN,
        'Superadmin should use /api/superadmin/tenants to create tenants'
      )
    }

    // Manager can only invite cashiers
    if (invitedBy.role === 'manager' && role !== 'cashier') {
      throw new BusinessError(
        ErrorCodes.FORBIDDEN,
        'Managers can only invite cashiers'
      )
    }

    // Cashier cannot invite anyone
    if (invitedBy.role === 'cashier') {
      throw new BusinessError(
        ErrorCodes.FORBIDDEN,
        'Cashiers cannot invite users'
      )
    }

    // ========== OUTLET VALIDATION ==========

    // Cashier role REQUIRES outletId
    if (role === 'cashier' && !outletId) {
      throw new BusinessError(
        ErrorCodes.VALIDATION_ERROR,
        'Cashier role requires an outletId'
      )
    }

    // Validate outlet belongs to tenant
    if (outletId) {
      const outlet = await prisma.outlet.findUnique({
        where: { id: outletId },
      })

      if (!outlet || outlet.tenantId !== invitedBy.tenantId) {
        throw new BusinessError(
          ErrorCodes.RESOURCE_NOT_FOUND,
          'Outlet not found or does not belong to your tenant'
        )
      }
    }

    // ========== CHECK EXISTING USER ==========

    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser && existingUser.status === 'active') {
      throw new BusinessError(
        ErrorCodes.VALIDATION_ERROR,
        'User with this email already exists'
      )
    }

    // ========== CREATE CLERK INVITATION ==========

    await clerkService.createInvitation({
      email,
      publicMetadata: {
        tenantId: invitedBy.tenantId,
        role,
        outletId: outletId || null,
      },
    })

    // ========== PRE-CREATE USER IN DB ==========

    if (existingUser) {
      // Update existing pending user
      await prisma.user.update({
        where: { email },
        data: {
          role,
          outletId,
          invitationStatus: 'pending',
          invitedAt: new Date(),
          invitedBy: invitedBy.id,
          status: 'pending',
        },
      })
      logger.info(`Updated pending user: ${existingUser.id}`)
    } else {
      // Create new pending user
      await prisma.user.create({
        data: {
          clerkId: '', // Will be filled by webhook
          email,
          firstName: '', // Will be filled by webhook
          lastName: '', // Will be filled by webhook
          role,
          tenantId: invitedBy.tenantId,
          outletId,
          invitationStatus: 'pending',
          invitedAt: new Date(),
          invitedBy: invitedBy.id,
          status: 'pending',
        },
      })
      logger.info(`Created pending user for: ${email}`)
    }

    logger.info(`Invitation sent to ${email}`)
  }
}
