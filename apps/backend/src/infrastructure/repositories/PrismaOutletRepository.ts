import type { PrismaClient, Outlet } from '@prisma/client'
import type { IOutletRepository, OutletWithStats, GetOutletsParams, CreateOutletInput, UpdateOutletInput } from '@/domain/repositories'

type DbClient = Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>

export class PrismaOutletRepository implements IOutletRepository {
  constructor(private readonly db: DbClient) {}

  async findAllByTenant(params: GetOutletsParams): Promise<OutletWithStats[]> {
    return await this.db.outlet.findMany({
      where: {
        tenantId: params.tenantId,
        ...(params.status && { status: params.status }),
      },
      orderBy: { name: 'asc' },
      take: params.limit,
      skip: params.offset,
      include: {
        _count: {
          select: {
            users: true,
            inventory: true,
            sales: true,
          },
        },
      },
    }) as OutletWithStats[]
  }

  async findById(id: string, tenantId: string): Promise<OutletWithStats | null> {
    return await this.db.outlet.findFirst({
      where: { id, tenantId },
      include: {
        _count: {
          select: {
            users: true,
            inventory: true,
            sales: true,
          },
        },
      },
    }) as OutletWithStats | null
  }

  async findByName(name: string, tenantId: string, excludeId?: string): Promise<Outlet | null> {
    return await this.db.outlet.findFirst({
      where: {
        name,
        tenantId,
        ...(excludeId && { id: { not: excludeId } }),
      },
    })
  }

  async create(data: CreateOutletInput): Promise<Outlet> {
    return await this.db.outlet.create({
      data: {
        name: data.name,
        tenantId: data.tenantId,
        address: data.address,
        phone: data.phone,
        email: data.email,
        currency: data.currency ?? 'USD',
        locale: data.locale ?? 'en-US',
        timezone: data.timezone ?? 'UTC',
      },
    })
  }

  async update(id: string, data: UpdateOutletInput): Promise<Outlet> {
    return await this.db.outlet.update({
      where: { id },
      data,
    })
  }

  async delete(id: string): Promise<void> {
    await this.db.outlet.delete({
      where: { id },
    })
  }

  async countUsersByOutlet(outletId: string): Promise<number> {
    return await this.db.user.count({
      where: { outletId },
    })
  }

  async countInventoryByOutlet(outletId: string): Promise<number> {
    return await this.db.inventory.count({
      where: { outletId },
    })
  }
}
