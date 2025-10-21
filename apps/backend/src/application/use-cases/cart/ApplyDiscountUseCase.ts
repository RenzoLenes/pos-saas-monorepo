import type { ICartRepository } from '@/domain/repositories'
import { NotFoundError, BusinessError, ErrorCodes } from '@/domain/errors'
import { Money, Discount } from '@/domain/value-objects'

export interface ApplyDiscountInput {
  cartId: string
  discountPercentage: number
  userRole: string
}

/**
 * Apply Discount Use Case
 * Applies a discount to the cart with role validation
 */
export class ApplyDiscountUseCase {
  constructor(
    private readonly cartRepository: ICartRepository
  ) {}

  async execute(input: ApplyDiscountInput): Promise<void> {
    const { cartId, discountPercentage, userRole } = input

    // Get cart
    const cart = await this.cartRepository.findById(cartId)
    if (!cart) {
      throw new NotFoundError('Carrito', { cartId })
    }

    // Validate discount
    const discount = Discount.from(discountPercentage)

    // Validate permissions
    if (!discount.isAllowedForRole(userRole)) {
      throw new BusinessError(
        ErrorCodes.BUSINESS_INSUFFICIENT_PERMISSIONS,
        `El rol ${userRole} no puede aplicar descuentos mayores a 10%`
      )
    }

    // Calculate discount amount
    const subtotal = Money.from(Number(cart.subtotal))
    const discountAmount = discount.applyTo(subtotal)
    const total = subtotal.subtract(discountAmount)

    // Update cart
    await this.cartRepository.updateCart(cartId, {
      discount: discountAmount.toNumber(),
      total: total.toNumber(),
      syncStatus: 'synced',
    })
  }
}
