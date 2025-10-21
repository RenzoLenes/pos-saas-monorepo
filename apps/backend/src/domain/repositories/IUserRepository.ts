import type { User } from '@prisma/client'

export interface UserWithOutlet extends Omit<User, 'clerkId'> {
  outlet: {
    id: string
    name: string
  } | null
}

export interface UserWithStats extends Omit<User, 'clerkId'> {
  outlet: {
    id: string
    name: string
  } | null
  _count: {
    sales: number
    carts: number
  }
}

export interface UserWithTenantAndOutlet extends Omit<User, 'clerkId'> {
  outlet: {
    id: string
    name: string
    address: string | null
  } | null
  tenant: {
    id: string
    name: string
    subdomain: string
    plan: string
    status: string
  } | null
}

export interface GetUsersParams {
  tenantId: string
  outletId?: string
  role?: 'admin' | 'manager' | 'cashier'
  status?: string
  limit?: number
  offset?: number
}

export interface UpdateUserInput {
  firstName?: string
  lastName?: string
  role?: 'admin' | 'manager' | 'cashier'
  outletId?: string | null
  status?: 'active' | 'inactive'
}

export interface IUserRepository {
  /**
   * Find all users by tenant with outlet relation
   */
  findAllByTenant(params: GetUsersParams): Promise<UserWithOutlet[]>

  /**
   * Find user by ID with outlet and stats
   */
  findById(id: string, tenantId: string): Promise<UserWithStats | null>

  /**
   * Find user by ID with tenant and outlet (for getCurrentUser)
   */
  findByIdWithTenantAndOutlet(id: string): Promise<UserWithTenantAndOutlet | null>

  /**
   * Find user by clerkId
   */
  findByClerkId(clerkId: string): Promise<User | null>

  /**
   * Update user by clerkId
   */
  updateByClerkId(clerkId: string, data: Partial<Pick<User, 'email' | 'firstName' | 'lastName' | 'status'>>): Promise<User>

  /**
   * Update user
   */
  update(id: string, data: UpdateUserInput): Promise<UserWithOutlet>
}
