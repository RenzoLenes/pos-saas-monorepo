import type { PrismaClient, Inventory, Prisma } from '@prisma/client'
import type { IInventoryRepository, CreateInventoryInput, InventoryWithRelations, GetInventoryByOutletParams } from '@/domain/repositories'

type DbClient = Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>

export class PrismaInventoryRepository implements IInventoryRepository {
  constructor(private readonly db: DbClient) {}

  async findById(inventoryId: string): Promise<Inventory | null> {
    return await this.db.inventory.findUnique({
      where: { id: inventoryId },
    })
  }

  async findByProductAndOutlet(productId: string, outletId: string): Promise<Inventory | null> {
    return await this.db.inventory.findFirst({
      where: {
        productId,
        outletId,
      },
    })
  }

  async create(data: CreateInventoryInput): Promise<Inventory> {
    return await this.db.inventory.create({
      data: {
        productId: data.productId,
        outletId: data.outletId,
        quantity: data.quantity,
        minStock: data.minStock,
        maxStock: data.maxStock,
        syncStatus: data.syncStatus ?? 'synced',
      },
    })
  }

  async update(inventoryId: string, data: Prisma.InventoryUpdateInput): Promise<Inventory> {
    return await this.db.inventory.update({
      where: { id: inventoryId },
      data,
    })
  }

  async deleteMany(where: Prisma.InventoryWhereInput): Promise<void> {
    await this.db.inventory.deleteMany({ where })
  }

  async findMany(params: {
    where: Prisma.InventoryWhereInput
    skip?: number
    take?: number
    orderBy?: Prisma.InventoryOrderByWithRelationInput
    include?: Prisma.InventoryInclude
  }): Promise<Inventory[]> {
    return await this.db.inventory.findMany(params)
  }

  async count(where: Prisma.InventoryWhereInput): Promise<number> {
    return await this.db.inventory.count({ where })
  }

  async getLowStockCount(outletId: string): Promise<number> {
    return await this.db.inventory.count({
      where: {
        outletId,
        quantity: {
          lte: this.db.inventory.fields.minStock,
        },
      },
    })
  }

  async findByOutletWithRelations(params: GetInventoryByOutletParams): Promise<InventoryWithRelations[]> {
    return await this.db.inventory.findMany({
      where: { outletId: params.outletId },
      include: {
        product: true,
        outlet: true,
      },
      take: params.limit,
      skip: params.offset,
      orderBy: { product: { name: 'asc' } },
    }) as InventoryWithRelations[]
  }

  async findByIdWithRelations(inventoryId: string): Promise<InventoryWithRelations | null> {
    return await this.db.inventory.findUnique({
      where: { id: inventoryId },
      include: {
        product: true,
        outlet: true,
      },
    }) as InventoryWithRelations | null
  }

  async findLowStockWithRelations(outletId: string): Promise<InventoryWithRelations[]> {
    return await this.db.inventory.findMany({
      where: {
        outletId,
        quantity: {
          lte: this.db.inventory.fields.minStock,
        },
      },
      include: {
        product: true,
        outlet: true,
      },
      orderBy: { quantity: 'asc' },
    }) as InventoryWithRelations[]
  }

  async findByProductIdWithRelations(productId: string, tenantId: string): Promise<InventoryWithRelations[]> {
    // First verify the product belongs to the tenant
    const product = await this.db.product.findFirst({
      where: {
        id: productId,
        tenantId,
      },
    })

    if (!product) {
      return []
    }

    return await this.db.inventory.findMany({
      where: {
        productId,
      },
      include: {
        outlet: true,
        product: true,
      },
      orderBy: {
        outlet: {
          name: 'asc',
        },
      },
    }) as InventoryWithRelations[]
  }
}
