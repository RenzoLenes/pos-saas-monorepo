import { Request, Response } from 'express'
import { UseCaseFactory } from '@infrastructure/factories'
import { CartMapper } from '@application/mappers'
import { z } from 'zod'

const addItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().positive(),
})

const updateItemSchema = z.object({
  quantity: z.number().int().positive(),
})

const applyDiscountSchema = z.object({
  discount: z.number().min(0).max(100),
})

const holdCartSchema = z.object({
  name: z.string().min(1),
})

const assignCustomerSchema = z.object({
  customerId: z.string().optional().nullable(),
})

export class CartController {
  /**
   * GET /api/carts
   * Get all carts for the current user
   */
  async getMyCarts(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id
    const outletId = req.user!.outletId || req.query.outletId as string

    if (!outletId) {
      res.status(400).json({
        success: false,
        error: {
          code: 'OUTLET_REQUIRED',
          message: 'Outlet ID is required',
        },
      })
      return
    }

    const useCase = UseCaseFactory.getGetMyCartsUseCase()

    const carts = await useCase.execute({
      userId,
      outletId,
    })

    const dtos = carts.map((cart) => CartMapper.toDTO(cart))

    res.json({
      success: true,
      data: dtos,
    })
  }

  /**
   * GET /api/carts/:id
   * Get cart by ID
   */
  async getById(req: Request, res: Response): Promise<void> {
    const { id } = req.params
    const useCase = UseCaseFactory.getGetCartByIdUseCase()

    const cart = await useCase.execute(id)

    res.json({
      success: true,
      data: CartMapper.toDTO(cart),
    })
  }

  /**
   * POST /api/carts
   * Create a new cart
   */
  async create(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id
    const outletId = req.user!.outletId || req.body.outletId
    const name = req.body.name as string

    if (!outletId) {
      res.status(400).json({
        success: false,
        error: {
          code: 'OUTLET_REQUIRED',
          message: 'Outlet ID is required',
        },
      })
      return
    }


    // Fetch the cart with items to return
    const getOrCreateUseCase = UseCaseFactory.getGetOrCreateCartUseCase()
    const cart = await getOrCreateUseCase.execute({
      userId,
      name,
      outletId: outletId,
    })

    res.status(201).json({
      success: true,
      data: CartMapper.toDTO(cart),
    })
  }

  /**
   * POST /api/carts/:id/items
   * Add item to cart
   */
  async addItem(req: Request, res: Response): Promise<void> {
    const { id } = req.params
    const data = addItemSchema.parse(req.body)

    const useCase = UseCaseFactory.getAddItemToCartUseCase()

    const cartItem = await useCase.execute({
      cartId: id,
      productId: data.productId,
      quantity: data.quantity,
    })

    res.json({
      success: true,
      data: cartItem,
    })
  }

  /**
   * PUT /api/carts/:id/items/:itemId
   * Update cart item quantity
   */
  async updateItem(req: Request, res: Response): Promise<void> {
    const { itemId } = req.params
    const data = updateItemSchema.parse(req.body)

    const useCase = UseCaseFactory.getUpdateCartItemUseCase()

    const cartItem = await useCase.execute({
      itemId,
      quantity: data.quantity,
    })

    res.json({
      success: true,
      data: cartItem,
    })
  }

  /**
   * DELETE /api/carts/:id/items/:itemId
   * Remove item from cart
   */
  async removeItem(req: Request, res: Response): Promise<void> {
    const { itemId } = req.params

    const useCase = UseCaseFactory.getRemoveCartItemUseCase()

    await useCase.execute({
      itemId,
    })

    res.json({
      success: true,
      message: 'Item removed from cart successfully',
    })
  }

  /**
   * PUT /api/carts/:id/discount
   * Apply discount to cart
   */
  async applyDiscount(req: Request, res: Response): Promise<void> {
    const { id } = req.params
    const data = applyDiscountSchema.parse(req.body)
    const userRole = req.user!.role

    const useCase = UseCaseFactory.getApplyDiscountUseCase()

    await useCase.execute({
      cartId: id,
      discountPercentage: data.discount,
      userRole,
    })

    // Fetch updated cart to return
    const getCartUseCase = UseCaseFactory.getGetCartByIdUseCase()
    const updatedCart = await getCartUseCase.execute(id)

    res.json({
      success: true,
      data: CartMapper.toDTO(updatedCart),
    })
  }

  /**
   * POST /api/carts/:id/hold
   * Put cart on hold
   */
  async hold(req: Request, res: Response): Promise<void> {
    const { id } = req.params
    const data = holdCartSchema.parse(req.body)

    const useCase = UseCaseFactory.getHoldCartUseCase()

    await useCase.execute({
      cartId: id,
      name: data.name,
    })

    // Fetch updated cart with items
    const getCartUseCase = UseCaseFactory.getGetCartByIdUseCase()
    const updatedCart = await getCartUseCase.execute(id)

    res.json({
      success: true,
      data: CartMapper.toDTO(updatedCart),
    })
  }

  /**
   * POST /api/carts/:id/activate
   * Activate a held cart
   */
  async activate(req: Request, res: Response): Promise<void> {
    const { id } = req.params

    const useCase = UseCaseFactory.getActivateCartUseCase()

    await useCase.execute({
      cartId: id,
    })

    // Fetch updated cart with items
    const getCartUseCase = UseCaseFactory.getGetCartByIdUseCase()
    const updatedCart = await getCartUseCase.execute(id)

    res.json({
      success: true,
      data: CartMapper.toDTO(updatedCart),
    })
  }

  /**
   * DELETE /api/carts/:id
   * Delete cart
   */
  async delete(req: Request, res: Response): Promise<void> {
    const { id } = req.params

    const useCase = UseCaseFactory.getDeleteCartUseCase()

    await useCase.execute({
      cartId: id,
    })

    res.json({
      success: true,
      message: 'Cart deleted successfully',
    })
  }

  /**
   * PUT /api/carts/:id/customer
   * Assign or remove customer from cart
   */
  async assignCustomer(req: Request, res: Response): Promise<void> {
    const { id } = req.params
    const data = assignCustomerSchema.parse(req.body)

    const useCase = UseCaseFactory.getAssignCustomerToCartUseCase()

    await useCase.execute({
      cartId: id,
      customerId: data.customerId,
    })

    // Fetch updated cart with items
    const getCartUseCase = UseCaseFactory.getGetCartByIdUseCase()
    const updatedCart = await getCartUseCase.execute(id)

    res.json({
      success: true,
      data: CartMapper.toDTO(updatedCart),
    })
  }

  /**
   * POST /api/carts/:id/clear
   * Clear all items from cart
   */
  async clear(req: Request, res: Response): Promise<void> {
    const { id } = req.params

    const useCase = UseCaseFactory.getClearCartUseCase()

    await useCase.execute(id)

    // Fetch updated cart to return
    const getCartUseCase = UseCaseFactory.getGetCartByIdUseCase()
    const updatedCart = await getCartUseCase.execute(id)

    res.json({
      success: true,
      data: CartMapper.toDTO(updatedCart),
    })
  }
}
