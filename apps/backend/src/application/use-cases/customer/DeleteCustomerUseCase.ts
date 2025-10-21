import type { ICustomerRepository } from '@/domain/repositories'
import { NotFoundError, BusinessError, ErrorCodes } from '@/domain/errors'

/**
 * Delete Customer Use Case
 * Deletes a customer after validating no sales history
 */
export class DeleteCustomerUseCase {
  constructor(
    private readonly customerRepository: ICustomerRepository
  ) {}

  async execute(customerId: string): Promise<void> {
    // Verify customer exists
    const customer = await this.customerRepository.findById(customerId)
    if (!customer) {
      throw new NotFoundError('Cliente', { customerId })
    }

    // Check if customer has sales history
    const hasSales = await this.customerRepository.hasSalesHistory(customerId)
    if (hasSales) {
      throw new BusinessError(
        ErrorCodes.BUSINESS_INVALID_OPERATION,
        'No se puede eliminar un cliente con historial de ventas'
      )
    }

    // Delete customer
    await this.customerRepository.delete(customerId)
  }
}
