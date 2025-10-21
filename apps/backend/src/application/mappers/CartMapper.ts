/**
 * Cart Mapper
 * Converts between Prisma models and Cart DTOs
 */

import type { Cart, CartItem, Product, Customer } from '@prisma/client'
import type { CartDTO, CartItemDTO, CartSummaryDTO } from '@/application/dtos'

type CartWithRelations = Cart & {
  items: (CartItem & {
    product: Product
  })[]
  customer?: Customer | null
}

export class CartMapper {
  /**
   * Convert Prisma Cart to CartDTO
   */
  static toDTO(cart: CartWithRelations): CartDTO {
    return {
      id: cart.id,
      userId: cart.userId,
      outletId: cart.outletId,
      customerId: cart.customerId,
      customerName: cart.customer
        ? `${cart.customer.firstName} ${cart.customer.lastName}`
        : null,
      name: cart.name,
      status: cart.status,
      subtotal: Number(cart.subtotal),
      discount: Number(cart.discount),
      total: Number(cart.total),
      syncStatus: cart.syncStatus,
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt,
      items: cart.items.map(item => this.toItemDTO(item)),
    }
  }

  /**
   * Convert Prisma CartItem to CartItemDTO
   */
  static toItemDTO(item: CartItem & { product: Product }): CartItemDTO {
    return {
      id: item.id,
      cartId: item.cartId,
      productId: item.productId,
      productName: item.product.name,
      productBarcode: item.product.barcode,
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
      totalPrice: Number(item.totalPrice),
      createdAt: item.createdAt,
    }
  }

  /**
   * Convert Prisma Cart to CartSummaryDTO (lighter version)
   */
  static toSummaryDTO(cart: CartWithRelations): CartSummaryDTO {
    return {
      id: cart.id,
      name: cart.name,
      customerName: cart.customer
        ? `${cart.customer.firstName} ${cart.customer.lastName}`
        : null,
      itemCount: cart.items.length,
      total: Number(cart.total),
      status: cart.status,
      updatedAt: cart.updatedAt,
    }
  }

  /**
   * Convert array of Carts to DTOs
   */
  static toDTOArray(carts: CartWithRelations[]): CartDTO[] {
    return carts.map(cart => this.toDTO(cart))
  }

  /**
   * Convert array of Carts to Summary DTOs
   */
  static toSummaryDTOArray(carts: CartWithRelations[]): CartSummaryDTO[] {
    return carts.map(cart => this.toSummaryDTO(cart))
  }
}
