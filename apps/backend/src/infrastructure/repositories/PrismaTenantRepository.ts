import type { PrismaClient } from '@prisma/client'
import type { ITenantRepository, TenantWithStats, TenantWithCounts, GlobalAnalytics } from '@/domain/repositories/ITenantRepository'

type DbClient = Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>

export class PrismaTenantRepository implements ITenantRepository {
  constructor(private readonly db: DbClient) {}

  async findById(id: string): Promise<TenantWithStats | null> {
    const tenant = await this.db.tenant.findUnique({
      where: { id },
    })

    if (!tenant) return null

    return {
      id: tenant.id,
      name: tenant.name,
      subdomain: tenant.subdomain,
      domain: tenant.domain,
      plan: tenant.plan,
      status: tenant.status,
      createdAt: tenant.createdAt,
      updatedAt: tenant.updatedAt,
    }
  }

  async findByIdWithStats(id: string): Promise<TenantWithStats | null> {
    const tenant = await this.db.tenant.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            outlets: true,
            users: true,
            customers: true,
            products: true,
            categories: true,
          },
        },
      },
    })

    if (!tenant) return null

    return {
      id: tenant.id,
      name: tenant.name,
      subdomain: tenant.subdomain,
      domain: tenant.domain,
      plan: tenant.plan,
      status: tenant.status,
      createdAt: tenant.createdAt,
      updatedAt: tenant.updatedAt,
      stats: {
        outlets: tenant._count.outlets,
        users: tenant._count.users,
        customers: tenant._count.customers,
        products: tenant._count.products,
        categories: tenant._count.categories,
      },
    }
  }

  async findBySubdomain(subdomain: string, excludeId?: string): Promise<TenantWithStats | null> {
    const tenant = await this.db.tenant.findFirst({
      where: {
        subdomain,
        ...(excludeId && { id: { not: excludeId } }),
      },
    })

    if (!tenant) return null

    return {
      id: tenant.id,
      name: tenant.name,
      subdomain: tenant.subdomain,
      domain: tenant.domain,
      plan: tenant.plan,
      status: tenant.status,
      createdAt: tenant.createdAt,
      updatedAt: tenant.updatedAt,
    }
  }

  async findByDomain(domain: string, excludeId?: string): Promise<TenantWithStats | null> {
    const tenant = await this.db.tenant.findFirst({
      where: {
        domain,
        ...(excludeId && { id: { not: excludeId } }),
      },
    })

    if (!tenant) return null

    return {
      id: tenant.id,
      name: tenant.name,
      subdomain: tenant.subdomain,
      domain: tenant.domain,
      plan: tenant.plan,
      status: tenant.status,
      createdAt: tenant.createdAt,
      updatedAt: tenant.updatedAt,
    }
  }

  async findAll(): Promise<TenantWithStats[]> {
    const tenants = await this.db.tenant.findMany({
      include: {
        _count: {
          select: {
            users: true,
            outlets: true,
            products: true,
            customers: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return tenants.map((tenant) => ({
      id: tenant.id,
      name: tenant.name,
      subdomain: tenant.subdomain,
      domain: tenant.domain,
      plan: tenant.plan,
      status: tenant.status,
      createdAt: tenant.createdAt,
      updatedAt: tenant.updatedAt,
      stats: {
        outlets: tenant._count.outlets,
        users: tenant._count.users,
        customers: tenant._count.customers,
        products: tenant._count.products,
        categories: 0,
      },
    }))
  }

  async update(id: string, data: Partial<Omit<TenantWithStats, 'id' | 'createdAt' | 'updatedAt' | 'stats'>>): Promise<TenantWithStats> {
    const tenant = await this.db.tenant.update({
      where: { id },
      data,
      include: {
        _count: {
          select: {
            outlets: true,
            users: true,
            customers: true,
            products: true,
            categories: true,
          },
        },
      },
    })

    return {
      id: tenant.id,
      name: tenant.name,
      subdomain: tenant.subdomain,
      domain: tenant.domain,
      plan: tenant.plan,
      status: tenant.status,
      createdAt: tenant.createdAt,
      updatedAt: tenant.updatedAt,
      stats: {
        outlets: tenant._count.outlets,
        users: tenant._count.users,
        customers: tenant._count.customers,
        products: tenant._count.products,
        categories: tenant._count.categories,
      },
    }
  }

  async updateStatus(id: string, status: 'active' | 'suspended' | 'inactive'): Promise<TenantWithStats> {
    const tenant = await this.db.tenant.update({
      where: { id },
      data: { status },
    })

    return {
      id: tenant.id,
      name: tenant.name,
      subdomain: tenant.subdomain,
      domain: tenant.domain,
      plan: tenant.plan,
      status: tenant.status,
      createdAt: tenant.createdAt,
      updatedAt: tenant.updatedAt,
    }
  }

  async count(): Promise<number> {
    return this.db.tenant.count()
  }

  async countByStatus(status: 'active' | 'suspended' | 'inactive'): Promise<number> {
    return this.db.tenant.count({ where: { status } })
  }

  async countByPlan(): Promise<{ plan: string; _count: number }[]> {
    const result = await this.db.tenant.groupBy({
      by: ['plan'],
      _count: true,
    })

    return result.map((item) => ({
      plan: item.plan,
      _count: item._count,
    }))
  }

  async findAllWithCounts(): Promise<TenantWithCounts[]> {
    return await this.db.tenant.findMany({
      include: {
        _count: {
          select: {
            users: true,
            outlets: true,
            products: true,
            customers: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }) as TenantWithCounts[]
  }

  async getGlobalAnalytics(): Promise<GlobalAnalytics> {
    const [totalTenants, totalUsers, totalSales, activeTenants, tenantsByPlan] = await Promise.all([
      this.count(),
      this.countUsers(),
      this.countSales(),
      this.countByStatus('active'),
      this.countByPlan(),
    ])

    return {
      totalTenants,
      activeTenants,
      totalUsers,
      totalSales,
      tenantsByPlan,
    }
  }

  async countUsers(): Promise<number> {
    return await this.db.user.count({
      where: { role: { not: 'superadmin' } },
    })
  }

  async countSales(): Promise<number> {
    return await this.db.sale.count()
  }
}
