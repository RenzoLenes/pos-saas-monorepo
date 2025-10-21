import type { ICustomerRepository, UpdateCustomerInput as RepositoryUpdateInput } from '@/domain/repositories'
import type { Customer } from '@prisma/client'
import { NotFoundError, BusinessError, ErrorCodes } from '@/domain/errors'

export interface UpdateCustomerInput extends RepositoryUpdateInput {
  customerId: string
}

/**
 * Update Customer Use Case
 * Updates customer information with validation
 */
export class UpdateCustomerUseCase {
  constructor(
    private readonly customerRepository: ICustomerRepository
  ) {}

  async execute(input: UpdateCustomerInput): Promise<Customer> {
    const { customerId, ...updateData } = input

    // Verify customer exists
    const customer = await this.customerRepository.findById(customerId)
    if (!customer) {
      throw new NotFoundError('Cliente', { customerId })
    }

    // Validate email if provided
    if (updateData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(updateData.email)) {
        throw new BusinessError(
          ErrorCodes.BUSINESS_INVALID_OPERATION,
          'Email inválido'
        )
      }

      // Check email uniqueness if changed
      if (updateData.email !== customer.email) {
        const existingCustomer = await this.customerRepository.findByEmail(
          updateData.email,
          customer.tenantId,
          customerId
        )

        if (existingCustomer) {
          throw new BusinessError(
            ErrorCodes.BUSINESS_DUPLICATE_ENTRY,
            'Ya existe un cliente con ese email',
            { email: updateData.email }
          )
        }
      }
    }

    // Update customer
    return await this.customerRepository.update(customerId, updateData)
  }
}
