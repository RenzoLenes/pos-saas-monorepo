import { Request, Response } from 'express'
import { Webhook } from 'svix'
import { WebhookEvent } from '@clerk/backend'
import { UseCaseFactory } from '@infrastructure/factories'
import { env } from '@infrastructure/config/env'
import { logger } from '@infrastructure/logger/logger'
import { clerkService } from '@infrastructure/services/ClerkService'
import { z } from 'zod'

const inviteUserSchema = z.object({
  email: z.string().email(),
  role: z.enum(['admin', 'manager', 'cashier']),
  outletId: z.string().optional(),
})

export class AuthController {
  /**
   * POST /api/auth/invite
   * Invite a new user to the tenant (Admin/Manager only)
   */
  async inviteUser(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id
    const userRole = req.user!.role
    const tenantId = req.user!.tenantId

    if (!tenantId) {
      res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_REQUEST',
          message: 'Superadmin should use /api/superadmin/tenants',
        },
      })
      return
    }

    const data = inviteUserSchema.parse(req.body)

    const useCase = UseCaseFactory.getInviteUserUseCase()
    await useCase.execute({
      email: data.email,
      role: data.role,
      outletId: data.outletId,
      invitedBy: {
        id: userId,
        role: userRole,
        tenantId,
      },
    })

    res.status(201).json({
      success: true,
      message: 'Invitation sent successfully',
    })
  }

  /**
   * GET /api/auth/me
   * Get current authenticated user info
   */
  async getCurrentUser(req: Request, res: Response): Promise<void> {
    const userId = req.user?.id

    if (!userId) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      })
      return
    }

    const useCase = UseCaseFactory.getGetCurrentUserUseCase()
    const user = await useCase.execute(userId)

    res.json({
      success: true,
      data: user,
    })
  }

  /**
   * POST /api/auth/webhook/clerk
   * Handle Clerk webhook events for user sync
   */
  async handleClerkWebhook(req: Request, res: Response): Promise<void> {
    try {
      // Get webhook signature headers
      const svix_id = req.headers['svix-id'] as string
      const svix_timestamp = req.headers['svix-timestamp'] as string
      const svix_signature = req.headers['svix-signature'] as string

      // Verify all required headers are present
      if (!svix_id || !svix_timestamp || !svix_signature) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_WEBHOOK',
            message: 'Missing Svix headers',
          },
        })
        return
      }

      // Verify webhook signature
      const webhookSecret = env.CLERK_WEBHOOK_SECRET || ''
      if (!webhookSecret) {
        logger.error('CLERK_WEBHOOK_SECRET is not configured')
        res.status(500).json({
          success: false,
          error: {
            code: 'WEBHOOK_NOT_CONFIGURED',
            message: 'Webhook secret not configured',
          },
        })
        return
      }

      const wh = new Webhook(webhookSecret)
      let evt: WebhookEvent

      try {
        // Verify the webhook signature
        const body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body)
        evt = wh.verify(body, {
          'svix-id': svix_id,
          'svix-timestamp': svix_timestamp,
          'svix-signature': svix_signature,
        }) as WebhookEvent
      } catch (err) {
        logger.error(`Webhook signature verification failed: ${err}`)
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_SIGNATURE',
            message: 'Invalid webhook signature',
          },
        })
        return
      }

      // Handle the webhook event
      const eventType = evt.type

      switch (eventType) {
        case 'user.created':
          await this.handleUserCreated(evt)
          break

        case 'user.updated':
          await this.handleUserUpdated(evt)
          break

        case 'user.deleted':
          await this.handleUserDeleted(evt)
          break

        default:
          logger.info(`Unhandled webhook event type: ${eventType}`)
      }

      // Return 200 OK to acknowledge receipt
      res.json({ success: true, message: 'Webhook processed' })
    } catch (error) {
      logger.error(`Webhook processing error: ${error}`)
      res.status(500).json({
        success: false,
        error: {
          code: 'WEBHOOK_ERROR',
          message: 'Failed to process webhook',
        },
      })
    }
  }

  /**
   * Handle user.created webhook event
   */
  private async handleUserCreated(evt: WebhookEvent): Promise<void> {
    if (evt.type !== 'user.created') return

    const userData = evt.data as any
    const { id } = userData

    logger.info(`Processing user.created webhook for Clerk ID: ${id}`)

    // Get primary email
    const emailAddresses = userData.email_addresses || []
    const primaryEmail = emailAddresses.find(
      (e: any) => e.id === userData.primary_email_address_id
    )
    const email = primaryEmail?.email_address || emailAddresses[0]?.email_address

    if (!email) {
      logger.error(`No email found for user: ${id}`)
      return
    }

    // ========== CHECK 1: SUPERADMIN ==========
    if (clerkService.isSuperadminEmail(email)) {
      logger.info(`Detected superadmin signup: ${email}`)
      const useCase = UseCaseFactory.getProcessSuperadminLoginUseCase()
      await useCase.execute(userData)
      return
    }

    // ========== CHECK 2: INVITED USER (has metadata) ==========
    const metadata = userData.public_metadata || {}
    if (metadata.tenantId) {
      logger.info(`Detected invited user signup: ${email}`)
      const useCase = UseCaseFactory.getProcessInvitedUserUseCase()
      await useCase.execute(userData)
      return
    }

    // ========== CHECK 3: FIRST SIGNUP (new tenant) ==========
    logger.info(`Detected first signup (new tenant): ${email}`)
    const useCase = UseCaseFactory.getProcessFirstSignupUseCase()
    await useCase.execute(userData)
  }

  /**
   * Handle user.updated webhook event
   */
  private async handleUserUpdated(evt: WebhookEvent): Promise<void> {
    if (evt.type !== 'user.updated') return

    const userData = evt.data as any
    const { id } = userData

    logger.info(`Processing user.updated webhook for Clerk ID: ${id}`)

    // Get primary email
    const emailAddresses = userData.email_addresses || []
    const primaryEmail = emailAddresses.find((e: any) => e.id === userData.primary_email_address_id)
    const email = primaryEmail?.email_address || emailAddresses[0]?.email_address

    const useCase = UseCaseFactory.getSyncUserFromClerkUseCase()
    await useCase.execute('update', {
      clerkId: id as string,
      email,
      firstName: userData.first_name,
      lastName: userData.last_name,
    })
  }

  /**
   * Handle user.deleted webhook event
   */
  private async handleUserDeleted(evt: WebhookEvent): Promise<void> {
    if (evt.type !== 'user.deleted') return

    const userData = evt.data as any
    const { id } = userData

    logger.info(`Processing user.deleted webhook for Clerk ID: ${id}`)

    const useCase = UseCaseFactory.getSyncUserFromClerkUseCase()
    await useCase.execute('delete', {
      clerkId: id as string,
    })
  }
}
