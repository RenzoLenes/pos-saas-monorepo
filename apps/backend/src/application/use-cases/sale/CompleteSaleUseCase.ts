import type { ISaleRepository, ICartRepository, IInventoryRepository, CartWithItems } from '@/domain/repositories'
import { Money, SaleNumber } from '@/domain/value-objects'
import { NotFoundError, BusinessError, ErrorCodes } from '@/domain/errors'
import { Payment } from '@/domain/entities/Sale'

// Type for payment input
export interface PaymentInput {
  cartId: string
  paymentMethod: 'cash' | 'card' | 'mixed'
  cashReceived?: number
}

/**
 * Complete Sale Use Case
 * Orchestrates the complete sale transaction
 */
export class CompleteSaleUseCase {
  constructor(
    private readonly saleRepository: ISaleRepository,
    private readonly cartRepository: ICartRepository,
    private readonly inventoryRepository: IInventoryRepository
  ) {}

  /**
   * Validate stock availability for cart items
   */
  private async validateStock(cart: CartWithItems): Promise<void> {
    for (const item of cart.items) {
      // Skip custom products
      if (item.product.isCustom) continue

      const inventory = await this.inventoryRepository.findByProductAndOutlet(
        item.productId,
        cart.outletId
      )

      if (!inventory) {
        throw new NotFoundError(
          `Inventario para ${item.product.name}`,
          { productId: item.productId, outletId: cart.outletId }
        )
      }

      if (inventory.quantity < item.quantity) {
        throw new BusinessError(
          ErrorCodes.BUSINESS_INSUFFICIENT_STOCK,
          `Stock insuficiente para ${item.product.name}`,
          {
            available: inventory.quantity,
            requested: item.quantity,
            productName: item.product.name
          }
        )
      }
    }
  }


  /**
   * Update inventory for sold items
   */
  private async updateInventory(cart: CartWithItems): Promise<void> {
    for (const item of cart.items) {
      // Skip custom products
      if (item.product.isCustom) continue

      const inventory = await this.inventoryRepository.findByProductAndOutlet(
        item.productId,
        cart.outletId
      )

      if (!inventory) continue

      await this.inventoryRepository.update(inventory.id, {
        quantity: inventory.quantity - item.quantity,
        lastUpdated: new Date(),
        syncStatus: 'synced',
      })
    }
  }

  /**
   * Execute the complete sale use case
   */
  async execute(
    cart: CartWithItems,
    payment: PaymentInput,
    userId: string
  ): Promise<any> {
    // Validate stock
    await this.validateStock(cart)

    // Create payment object and validate
    const cartTotal = Money.from(Number(cart.total))
    let paymentObj: Payment

    if (payment.paymentMethod === 'cash') {
      if (!payment.cashReceived) {
        throw new BusinessError(
          ErrorCodes.BUSINESS_INVALID_PAYMENT,
          'Se requiere el monto de efectivo recibido'
        )
      }
      const cashReceived = Money.from(payment.cashReceived)
      const change = Payment.calculateChange(cashReceived, cartTotal)
      paymentObj = Payment.cash(payment.cashReceived, change.getValue())
    } else if (payment.paymentMethod === 'card') {
      paymentObj = Payment.card()
    } else {
      throw new BusinessError(
        ErrorCodes.BUSINESS_INVALID_PAYMENT,
        'Método de pago no soportado'
      )
    }

    // Validate payment is sufficient
    paymentObj.validatePayment(cartTotal)

    // Generate sale number
    const lastSale = await this.saleRepository.getLastSale(cart.outletId)
    const saleNumber = SaleNumber.generateNext(lastSale || undefined)

    // Create sale
    const sale = await this.saleRepository.createSale({
      saleNumber: saleNumber.getValue(),
      customerId: cart.customerId,
      outletId: cart.outletId,
      userId,
      subtotal: Number(cart.subtotal),
      discount: Number(cart.discount),
      total: Number(cart.total),
      paymentMethod: paymentObj.method,
      cashReceived: paymentObj.cashReceived?.getValue() || null,
      change: paymentObj.change?.getValue() || 0,
      items: cart.items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        totalPrice: Number(item.totalPrice),
      })),
    })

    // Update inventory
    await this.updateInventory(cart)

    // Mark cart as completed and delete items
    await this.cartRepository.updateCart(cart.id, {
      status: 'completed',
      syncStatus: 'synced',
    })

    await this.cartRepository.deleteAllItems(cart.id)

    return sale
  }
}
