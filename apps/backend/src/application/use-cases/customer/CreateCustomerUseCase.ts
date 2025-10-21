import type { ICustomerRepository, CreateCustomerInput } from '@/domain/repositories'
import type { Customer } from '@prisma/client'
import { BusinessError, ErrorCodes } from '@/domain/errors'

/**
 * Create Customer Use Case
 * Creates a new customer with validation
 */
export class CreateCustomerUseCase {
  constructor(
    private readonly customerRepository: ICustomerRepository
  ) {}

  async execute(input: CreateCustomerInput): Promise<Customer> {
    // Validate required fields
    if (!input.firstName || !input.lastName) {
      throw new BusinessError(
        ErrorCodes.BUSINESS_INVALID_OPERATION,
        'Nombre y apellido son requeridos'
      )
    }

    // Validate email if provided
    if (input.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(input.email)) {
        throw new BusinessError(
          ErrorCodes.BUSINESS_INVALID_OPERATION,
          'Email inválido'
        )
      }

      // Check email uniqueness
      const existingCustomer = await this.customerRepository.findByEmail(
        input.email,
        input.tenantId
      )

      if (existingCustomer) {
        throw new BusinessError(
          ErrorCodes.BUSINESS_DUPLICATE_ENTRY,
          'Ya existe un cliente con ese email',
          { email: input.email }
        )
      }
    }

    // Create customer
    return await this.customerRepository.create({
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      phone: input.phone,
      address: input.address,
      tenantId: input.tenantId,
    })
  }
}
