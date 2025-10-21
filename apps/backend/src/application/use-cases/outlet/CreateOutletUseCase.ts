import type { IOutletRepository, CreateOutletInput } from '@/domain/repositories'
import type { Outlet } from '@prisma/client'
import { BusinessError } from '@/domain/errors'

/**
 * Create Outlet Use Case
 * Creates a new outlet with validation
 */
export class CreateOutletUseCase {
  constructor(private readonly outletRepository: IOutletRepository) {}

  async execute(data: CreateOutletInput): Promise<Outlet> {
    // Check if outlet with same name already exists
    const existing = await this.outletRepository.findByName(data.name, data.tenantId)

    if (existing) {
      throw new BusinessError('An outlet with this name already exists')
    }

    return await this.outletRepository.create(data)
  }
}
