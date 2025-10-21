import type { Outlet } from '@prisma/client'

export interface OutletWithStats extends Outlet {
  _count: {
    users: number
    inventory: number
    sales: number
  }
}

export interface GetOutletsParams {
  tenantId: string
  status?: 'active' | 'inactive'
  limit?: number
  offset?: number
}

export interface CreateOutletInput {
  name: string
  tenantId: string
  address?: string
  phone?: string
  email?: string
  currency?: string
  locale?: string
  timezone?: string
}

export interface UpdateOutletInput {
  name?: string
  address?: string
  phone?: string
  email?: string
  currency?: string
  locale?: string
  timezone?: string
  status?: 'active' | 'inactive'
}

export interface IOutletRepository {
  /**
   * Find all outlets for a tenant with stats
   */
  findAllByTenant(params: GetOutletsParams): Promise<OutletWithStats[]>

  /**
   * Find outlet by ID with stats
   */
  findById(id: string, tenantId: string): Promise<OutletWithStats | null>

  /**
   * Find outlet by name within tenant
   */
  findByName(name: string, tenantId: string, excludeId?: string): Promise<Outlet | null>

  /**
   * Create a new outlet
   */
  create(data: CreateOutletInput): Promise<Outlet>

  /**
   * Update an outlet
   */
  update(id: string, data: UpdateOutletInput): Promise<Outlet>

  /**
   * Delete an outlet
   */
  delete(id: string): Promise<void>

  /**
   * Count users assigned to an outlet
   */
  countUsersByOutlet(outletId: string): Promise<number>

  /**
   * Count inventory items in an outlet
   */
  countInventoryByOutlet(outletId: string): Promise<number>
}
