import type { Product, Prisma } from '@prisma/client'

export interface CreateProductInput {
  name: string
  description?: string
  price: number
  barcode?: string
  categoryId?: string
  tenantId: string
  isCustom: boolean
}

export interface IProductRepository {
  /**
   * Find product by ID
   */
  findById(productId: string): Promise<Product | null>

  /**
   * Find product by barcode
   */
  findByBarcode(barcode: string, tenantId: string, excludeProductId?: string): Promise<Product | null>

  /**
   * Create product
   */
  create(data: CreateProductInput): Promise<Product>

  /**
   * Update product
   */
  update(productId: string, data: Prisma.ProductUpdateInput): Promise<Product>

  /**
   * Delete product
   */
  delete(productId: string): Promise<void>

  /**
   * Find many products with filters
   */
  findMany(params: {
    where: Prisma.ProductWhereInput
    skip?: number
    take?: number
    orderBy?: Prisma.ProductOrderByWithRelationInput
    include?: Prisma.ProductInclude
  }): Promise<Product[]>

  /**
   * Count products
   */
  count(where: Prisma.ProductWhereInput): Promise<number>

  /**
   * Check if product has sales history
   */
  hasSalesHistory(productId: string): Promise<boolean>
}
