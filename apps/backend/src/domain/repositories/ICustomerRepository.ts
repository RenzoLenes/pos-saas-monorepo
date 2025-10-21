import type { Customer, Prisma } from '@prisma/client'

export interface CreateCustomerInput {
  firstName: string
  lastName: string
  email?: string
  phone?: string
  address?: string
  tenantId: string
}

export interface UpdateCustomerInput {
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  address?: string
}

export interface ICustomerRepository {
  /**
   * Find customer by ID
   */
  findById(customerId: string): Promise<Customer | null>

  /**
   * Find customer by email
   */
  findByEmail(email: string, tenantId: string, excludeCustomerId?: string): Promise<Customer | null>

  /**
   * Create customer
   */
  create(data: CreateCustomerInput): Promise<Customer>

  /**
   * Update customer
   */
  update(customerId: string, data: UpdateCustomerInput): Promise<Customer>

  /**
   * Delete customer
   */
  delete(customerId: string): Promise<void>

  /**
   * Find many customers
   */
  findMany(params: {
    where: Prisma.CustomerWhereInput
    skip?: number
    take?: number
    orderBy?: Prisma.CustomerOrderByWithRelationInput
  }): Promise<Customer[]>

  /**
   * Count customers
   */
  count(where: Prisma.CustomerWhereInput): Promise<number>

  /**
   * Check if customer has sales history
   */
  hasSalesHistory(customerId: string): Promise<boolean>

  /**
   * Get customer purchase statistics
   */
  getStats(customerId: string): Promise<{
    totalSpent: number
    totalPurchases: number
    lastPurchaseDate: Date | null
    averageTicket: number
  }>

  getAll (tenantId: string): Promise<Customer[]>
}
