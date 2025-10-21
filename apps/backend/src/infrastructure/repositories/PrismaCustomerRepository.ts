import type { PrismaClient, Customer, Prisma } from '@prisma/client'
import type { ICustomerRepository, CreateCustomerInput, UpdateCustomerInput } from '@/domain/repositories'

type DbClient = Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>

export class PrismaCustomerRepository implements ICustomerRepository {
  constructor(private readonly db: DbClient) {}

  async findById(customerId: string): Promise<Customer | null> {
    return await this.db.customer.findUnique({
      where: { id: customerId },
    })
  }

  async findByEmail(email: string, tenantId: string, excludeCustomerId?: string): Promise<Customer | null> {
    return await this.db.customer.findFirst({
      where: {
        email,
        tenantId,
        ...(excludeCustomerId && { id: { not: excludeCustomerId } }),
      },
    })
  }

  async create(data: CreateCustomerInput): Promise<Customer> {
    return await this.db.customer.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        address: data.address,
        tenant: {
          connect: { id: data.tenantId },
        },
      },
    })
  }

  async update(customerId: string, data: UpdateCustomerInput): Promise<Customer> {
    return await this.db.customer.update({
      where: { id: customerId },
      data,
    })
  }

  async delete(customerId: string): Promise<void> {
    await this.db.customer.delete({
      where: { id: customerId },
    })
  }

  async findMany(params: {
    where: Prisma.CustomerWhereInput
    skip?: number
    take?: number
    orderBy?: Prisma.CustomerOrderByWithRelationInput
  }): Promise<Customer[]> {
    return await this.db.customer.findMany(params)
  }

  async count(where: Prisma.CustomerWhereInput): Promise<number> {
    return await this.db.customer.count({ where })
  }

  async hasSalesHistory(customerId: string): Promise<boolean> {
    const count = await this.db.sale.count({
      where: { customerId },
    })
    return count > 0
  }

  async getStats(customerId: string): Promise<{
    totalSpent: number
    totalPurchases: number
    lastPurchaseDate: Date | null
    averageTicket: number
  }> {
    const sales = await this.db.sale.findMany({
      where: { customerId },
      select: {
        total: true,
        createdAt: true,
      },
    })

    const totalSpent = sales.reduce((sum, sale) => sum + Number(sale.total), 0)
    const totalPurchases = sales.length
    const lastPurchaseDate = sales.length > 0
      ? sales.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0].createdAt
      : null

    return {
      totalSpent,
      totalPurchases,
      lastPurchaseDate,
      averageTicket: totalPurchases > 0 ? totalSpent / totalPurchases : 0,
    }
  }

  async getAll(tenantId: string): Promise<Customer[]> {

    console.log(tenantId)
    return await this.db.customer.findMany({
      where: { tenantId },
    })
  }
}
