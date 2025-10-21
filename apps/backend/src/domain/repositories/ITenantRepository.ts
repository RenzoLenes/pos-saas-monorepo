export interface TenantStats {
  outlets: number
  users: number
  customers: number
  products: number
  categories: number
}

export interface TenantWithStats {
  id: string
  name: string
  subdomain: string
  domain: string | null
  plan: string
  status: string
  createdAt: Date
  updatedAt: Date
  stats?: TenantStats
}

export interface TenantWithCounts extends Omit<TenantWithStats, 'stats'> {
  _count: {
    users: number
    outlets: number
    products: number
    customers: number
  }
}

export interface GlobalAnalytics {
  totalTenants: number
  activeTenants: number
  totalUsers: number
  totalSales: number
  tenantsByPlan: { plan: string; _count: number }[]
}

export interface UpdateTenantInput {
  name?: string
  subdomain?: string
  domain?: string | null
  plan?: string
  status?: string
}

export interface ITenantRepository {
  findById(id: string): Promise<TenantWithStats | null>
  findByIdWithStats(id: string): Promise<TenantWithStats | null>
  findBySubdomain(subdomain: string, excludeId?: string): Promise<TenantWithStats | null>
  findByDomain(domain: string, excludeId?: string): Promise<TenantWithStats | null>
  findAll(): Promise<TenantWithStats[]>
  update(id: string, data: UpdateTenantInput): Promise<TenantWithStats>
  updateStatus(id: string, status: 'active' | 'suspended' | 'inactive'): Promise<TenantWithStats>
  count(): Promise<number>
  countByStatus(status: 'active' | 'suspended' | 'inactive'): Promise<number>
  countByPlan(): Promise<{ plan: string; _count: number }[]>

  /**
   * Find all tenants with _count for users, outlets, products, customers
   */
  findAllWithCounts(): Promise<TenantWithCounts[]>

  /**
   * Get global analytics across all tenants
   */
  getGlobalAnalytics(): Promise<GlobalAnalytics>

  /**
   * Count total users (excluding superadmins)
   */
  countUsers(): Promise<number>

  /**
   * Count total sales across all tenants
   */
  countSales(): Promise<number>
}
