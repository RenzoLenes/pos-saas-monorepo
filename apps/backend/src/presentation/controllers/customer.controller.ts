import { Request, Response } from 'express'
import { UseCaseFactory } from '@infrastructure/factories'
import { CustomerMapper } from '@application/mappers'
import { z } from 'zod'

const createCustomerSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
})

const updateCustomerSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
})

const searchQuerySchema = z.object({
  q: z.string().optional(),
  limit: z.number().int().positive().optional(),
  offset: z.number().int().min(0).optional(),
})

export class CustomerController {
  /**
   * GET /api/customers
   * Search customers with filters
   */
  async search(req: Request, res: Response): Promise<void> {
    const tenantId = req.user!.tenantId || ''
    const query = searchQuerySchema.parse({
      q: req.query.q,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      offset: req.query.offset ? parseInt(req.query.offset as string) : undefined,
    })

    const useCase = UseCaseFactory.getSearchCustomersUseCase()

    const customers = await useCase.execute({
      tenantId,
      query: query.q,
      limit: query.limit,
      offset: query.offset,
    })

    const dtos = customers.map((customer) => CustomerMapper.toDTO(customer))

    res.json({
      success: true,
      data: dtos,
    })
  }

  /**
   * GET /api/customers/:id
   * Get customer by ID
   */
  async getById(req: Request, res: Response): Promise<void> {
    const { id } = req.params

    const useCase = UseCaseFactory.getGetCustomerByIdUseCase()

    const customer = await useCase.execute(id)

    res.json({
      success: true,
      data: CustomerMapper.toDTO(customer),
    })
  }

  /**
   * POST /api/customers
   * Create a new customer
   */
  async create(req: Request, res: Response): Promise<void> {
    const tenantId = req.user!.tenantId || ''
    const data = createCustomerSchema.parse(req.body)

    const useCase = UseCaseFactory.getCreateCustomerUseCase()

    const customer = await useCase.execute({
      ...data,
      tenantId,
    })

    res.status(201).json({
      success: true,
      data: CustomerMapper.toDTO(customer),
    })
  }

  /**
   * PUT /api/customers/:id
   * Update customer
   */
  async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params
    const data = updateCustomerSchema.parse(req.body)

    const useCase = UseCaseFactory.getUpdateCustomerUseCase()

    const customer = await useCase.execute({
      customerId: id,
      ...data,
    })

    res.json({
      success: true,
      data: CustomerMapper.toDTO(customer),
    })
  }

  /**
   * DELETE /api/customers/:id
   * Delete customer
   */
  async delete(req: Request, res: Response): Promise<void> {
    const { id } = req.params

    const useCase = UseCaseFactory.getDeleteCustomerUseCase()

    await useCase.execute(id)

    res.json({
      success: true,
      message: 'Customer deleted successfully',
    })
  }

  /**
   * GET /api/customers/:id/stats
   * Get customer statistics
   */
  async getStats(req: Request, res: Response): Promise<void> {
    const { id } = req.params

    const useCase = UseCaseFactory.getGetCustomerStatsUseCase()

    const stats = await useCase.execute(id)

    res.json({
      success: true,
      data: stats,
    })
  }

  async getAll(req: Request, res: Response): Promise<void> {

    const { tenantId } = req.params

    console.log(req.params)

    const useCase = UseCaseFactory.getGetCustomerByTenantUseCase()

    const customers = await useCase.execute(tenantId)


    res.json({
      success: true,
      data: customers.map(CustomerMapper.toDTO),
    })
  }
}
