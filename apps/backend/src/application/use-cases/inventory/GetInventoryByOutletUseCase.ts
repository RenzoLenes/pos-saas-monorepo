import type { IInventoryRepository } from '@/domain/repositories'
import type { Inventory, Prisma } from '@prisma/client'

export interface GetInventoryByOutletInput {
  outletId: string
  limit?: number
  offset?: number
}

/**
 * Get Inventory by Outlet Use Case
 * Retrieves all inventory items for a specific outlet
 */
export class GetInventoryByOutletUseCase {
  constructor(
    private readonly inventoryRepository: IInventoryRepository
  ) {}

  async execute(input: GetInventoryByOutletInput): Promise<Inventory[]> {
    const where: Prisma.InventoryWhereInput = {
      outletId: input.outletId,
    }

    return await this.inventoryRepository.findMany({
      where,
      skip: input.offset,
      take: input.limit,
      orderBy: { lastUpdated: 'desc' },
      include: {
        product: true,
      },
    })
  }
}
