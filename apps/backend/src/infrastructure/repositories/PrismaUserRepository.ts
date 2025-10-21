import type { PrismaClient, User } from '@prisma/client'
import type { IUserRepository, UserWithOutlet, UserWithStats, UserWithTenantAndOutlet, GetUsersParams, UpdateUserInput } from '@/domain/repositories'

type DbClient = Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>

export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly db: DbClient) {}

  async findAllByTenant(params: GetUsersParams): Promise<UserWithOutlet[]> {
    const users = await this.db.user.findMany({
      where: {
        tenantId: params.tenantId,
        ...(params.outletId && { outletId: params.outletId }),
        ...(params.role && { role: params.role }),
        ...(params.status && { status: params.status }),
      },
      orderBy: { firstName: 'asc' },
      take: params.limit,
      skip: params.offset,
      include: {
        outlet: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    // Remove sensitive fields (clerkId)
    return users.map(({ clerkId, ...user }) => user) as UserWithOutlet[]
  }

  async findById(id: string, tenantId: string): Promise<UserWithStats | null> {
    const user = await this.db.user.findFirst({
      where: { id, tenantId },
      include: {
        outlet: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            sales: true,
            carts: true,
          },
        },
      },
    })

    if (!user) return null

    // Remove sensitive fields (clerkId)
    const { clerkId, ...sanitizedUser } = user
    return sanitizedUser as UserWithStats
  }

  async findByIdWithTenantAndOutlet(id: string): Promise<UserWithTenantAndOutlet | null> {
    const user = await this.db.user.findUnique({
      where: { id },
      include: {
        outlet: {
          select: {
            id: true,
            name: true,
            address: true,
          },
        },
        tenant: {
          select: {
            id: true,
            name: true,
            subdomain: true,
            plan: true,
            status: true,
          },
        },
      },
    })

    if (!user) return null

    // Remove sensitive fields (clerkId)
    const { clerkId, ...sanitizedUser } = user
    return sanitizedUser as UserWithTenantAndOutlet
  }

  async findByClerkId(clerkId: string): Promise<User | null> {
    return await this.db.user.findUnique({
      where: { clerkId },
    })
  }

  async updateByClerkId(
    clerkId: string,
    data: Partial<Pick<User, 'email' | 'firstName' | 'lastName' | 'status'>>
  ): Promise<User> {
    return await this.db.user.update({
      where: { clerkId },
      data,
    })
  }

  async update(id: string, data: UpdateUserInput): Promise<UserWithOutlet> {
    const updated = await this.db.user.update({
      where: { id },
      data,
      include: {
        outlet: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    // Remove sensitive fields (clerkId)
    const { clerkId, ...sanitizedUser } = updated
    return sanitizedUser as UserWithOutlet
  }
}
