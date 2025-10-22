import type { PrismaClient, Product, Prisma } from '@prisma/client'
import type { IProductRepository, CreateProductInput } from '@/domain/repositories'

type DbClient = Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>

export class PrismaProductRepository implements IProductRepository {
  constructor(private readonly db: DbClient) {}

  async findById(productId: string): Promise<Product | null> {
    return await this.db.product.findUnique({
      where: { id: productId },
    })
  }

  async findByBarcode(barcode: string, tenantId: string, excludeProductId?: string): Promise<Product | null> {
    return await this.db.product.findFirst({
      where: {
        barcode,
        tenantId,
        ...(excludeProductId && { id: { not: excludeProductId } }),
      },
    })
  }

  async create(data: CreateProductInput): Promise<Product> {
    return await this.db.product.create({
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        barcode: data.barcode,
        categoryId: data.categoryId,
        tenantId: data.tenantId,
        isCustom: data.isCustom,
      },
    })
  }

  async update(productId: string, data: Prisma.ProductUpdateInput): Promise<Product> {
    return await this.db.product.update({
      where: { id: productId },
      data,
    })
  }

  async delete(productId: string): Promise<void> {
    await this.db.product.delete({
      where: { id: productId },
    })
  }

  async findMany(params: {
    where: Prisma.ProductWhereInput
    skip?: number
    take?: number
    orderBy?: Prisma.ProductOrderByWithRelationInput
    include?: Prisma.ProductInclude
  }): Promise<Product[]> {
    return await this.db.product.findMany({
    ...params,
    include:{
      category: {
        select:{
          name: true
        }
      }
    }
    })
  }

  async count(where: Prisma.ProductWhereInput): Promise<number> {
    return await this.db.product.count({ where })
  }

  async hasSalesHistory(productId: string): Promise<boolean> {
    const count = await this.db.saleItem.count({
      where: { productId },
    })
    return count > 0
  }
}
