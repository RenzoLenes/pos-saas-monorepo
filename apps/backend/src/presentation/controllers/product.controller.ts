import { Request, Response } from 'express'
import { UseCaseFactory } from '@infrastructure/factories'
import { ProductMapper } from '@application/mappers'
import { createProductSchema, updateProductSchema } from 'shared-types'

export class ProductController {
  async getAll(req: Request, res: Response): Promise<void> {
    const tenantId = req.user!.tenantId || ''
    const includeInactive = req.query.includeInactive === 'true'

    const useCase = UseCaseFactory.getGetAllProductsUseCase()

    const products = await useCase.execute({ tenantId, includeInactive })
    const dtos = products.map((p) => ProductMapper.toDTO(p))

    res.json({
      success: true,
      data: dtos,
    })
  }

  async getById(req: Request, res: Response): Promise<void> {
    const { id } = req.params

    const useCase = UseCaseFactory.getGetProductByIdUseCase()

    const product = await useCase.execute(id)

    res.json({
      success: true,
      data: ProductMapper.toDTO(product),
    })
  }

  async create(req: Request, res: Response): Promise<void> {
    const tenantId = req.user!.tenantId || ''
    const data = createProductSchema.parse(req.body)

    const useCase = UseCaseFactory.getCreateProductUseCase()

    const product = await useCase.execute({
      ...data,
      tenantId,
    })

    res.status(201).json({
      success: true,
      data: ProductMapper.toDTO(product),
    })
  }

  async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params
    const updateData = updateProductSchema.parse(req.body)

    const useCase = UseCaseFactory.getUpdateProductUseCase()

    const product = await useCase.execute({
      productId: id, // Use ID from URL params
      ...updateData,
    })

    res.json({
      success: true,
      data: ProductMapper.toDTO(product),
    })
  }

  async delete(req: Request, res: Response): Promise<void> {
    const { id } = req.params

    const useCase = UseCaseFactory.getDeleteProductUseCase()

    await useCase.execute(id)

    res.json({
      success: true,
      message: 'Product deleted successfully',
    })
  }

  async search(req: Request, res: Response): Promise<void> {
    const { q } = req.query
    const tenantId = req.user!.tenantId || ''

    if (!q || typeof q !== 'string') {
      res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_QUERY',
          message: 'Search query is required',
        },
      })
      return
    }

    const useCase = UseCaseFactory.getSearchProductsUseCase()

    const products = await useCase.execute({ query: q, tenantId })
    const dtos = products.map((p) => ProductMapper.toDTO(p))

    res.json({
      success: true,
      data: dtos,
    })
  }

  async getByBarcode(req: Request, res: Response): Promise<void> {
    const { barcode } = req.params
    const tenantId = req.user!.tenantId || ''

    const useCase = UseCaseFactory.getGetProductByBarcodeUseCase()

    const product = await useCase.execute(barcode, tenantId)

    res.json({
      success: true,
      data: ProductMapper.toDTO(product),
    })
  }

  async getByCategory(req: Request, res: Response): Promise<void> {
    const { categoryId } = req.params
    const tenantId = req.user!.tenantId || ''

    const useCase = UseCaseFactory.getGetProductsByCategoryUseCase()

    const products = await useCase.execute({ categoryId, tenantId })
    const dtos = products.map((p) => ProductMapper.toDTO(p))

    res.json({
      success: true,
      data: dtos,
    })
  }
}
