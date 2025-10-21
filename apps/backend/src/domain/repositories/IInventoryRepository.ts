import type { Inventory, Product, Outlet, Prisma } from '@prisma/client'

export interface CreateInventoryInput {
  productId: string
  outletId: string
  quantity: number
  minStock: number
  maxStock?: number
  syncStatus?: string
}

export type InventoryWithRelations = Inventory & {
  product: Product
  outlet: Outlet
}

export interface GetInventoryByOutletParams {
  outletId: string
  limit?: number
  offset?: number
}

export interface IInventoryRepository {
  /**
   * Find inventory by ID
   */
  findById(inventoryId: string): Promise<Inventory | null>

  /**
   * Find inventory for product at outlet
   */
  findByProductAndOutlet(productId: string, outletId: string): Promise<Inventory | null>

  /**
   * Create inventory record
   */
  create(data: CreateInventoryInput): Promise<Inventory>

  /**
   * Update inventory
   */
  update(inventoryId: string, data: Prisma.InventoryUpdateInput): Promise<Inventory>

  /**
   * Delete many inventory records
   */
  deleteMany(where: Prisma.InventoryWhereInput): Promise<void>

  /**
   * Find many inventory records
   */
  findMany(params: {
    where: Prisma.InventoryWhereInput
    skip?: number
    take?: number
    orderBy?: Prisma.InventoryOrderByWithRelationInput
    include?: Prisma.InventoryInclude
  }): Promise<Inventory[]>

  /**
   * Count inventory records
   */
  count(where: Prisma.InventoryWhereInput): Promise<number>

  /**
   * Get low stock count for outlet
   */
  getLowStockCount(outletId: string): Promise<number>

  /**
   * Find inventory by outlet with relations (product, outlet)
   */
  findByOutletWithRelations(params: GetInventoryByOutletParams): Promise<InventoryWithRelations[]>

  /**
   * Find inventory by ID with relations (product, outlet)
   */
  findByIdWithRelations(inventoryId: string): Promise<InventoryWithRelations | null>

  /**
   * Find low stock items with relations (product, outlet)
   */
  findLowStockWithRelations(outletId: string): Promise<InventoryWithRelations[]>

  /**
   * Find all inventory for a product with relations (product, outlet)
   */
  findByProductIdWithRelations(productId: string, tenantId: string): Promise<InventoryWithRelations[]>
}
