/**
 * Sale Mapper
 * Converts between Prisma models and Sale DTOs
 */

import type { Sale, SaleItem, Product, Customer } from '@prisma/client'
import type { SaleDTO, SaleItemDTO, SaleSummaryDTO } from '@/application/dtos'

type SaleWithRelations = Sale & {
  items: (SaleItem & {
    product: Product
  })[]
  customer?: Customer | null
}

export class SaleMapper {
  /**
   * Convert Prisma Sale to SaleDTO
   */
  static toDTO(sale: SaleWithRelations): SaleDTO {
    return {
      id: sale.id,
      saleNumber: sale.saleNumber,
      outletId: sale.outletId,
      userId: sale.userId,
      customerId: sale.customerId,
      customerName: sale.customer
        ? `${sale.customer.firstName} ${sale.customer.lastName}`
        : null,
      subtotal: Number(sale.subtotal),
      discount: Number(sale.discount),
      total: Number(sale.total),
      paymentMethod: sale.paymentMethod,
      cashReceived: sale.cashReceived ? Number(sale.cashReceived) : null,
      change: sale.change ? Number(sale.change) : null,
      createdAt: sale.createdAt,
      items: sale.items.map(item => this.toItemDTO(item)),
    }
  }

  /**
   * Convert Prisma SaleItem to SaleItemDTO
   */
  static toItemDTO(item: SaleItem & { product: Product }): SaleItemDTO {
    return {
      id: item.id,
      productId: item.productId,
      productName: item.product.name,
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
      totalPrice: Number(item.totalPrice),
    }
  }

  /**
   * Convert Prisma Sale to SaleSummaryDTO (lighter version)
   */
  static toSummaryDTO(sale: SaleWithRelations): SaleSummaryDTO {
    return {
      id: sale.id,
      saleNumber: sale.saleNumber,
      total: Number(sale.total),
      paymentMethod: sale.paymentMethod,
      customerName: sale.customer
        ? `${sale.customer.firstName} ${sale.customer.lastName}`
        : null,
      createdAt: sale.createdAt,
      itemCount: sale.items.length,
    }
  }

  /**
   * Convert array of Sales to DTOs
   */
  static toDTOArray(sales: SaleWithRelations[]): SaleDTO[] {
    return sales.map(sale => this.toDTO(sale))
  }

  /**
   * Convert array of Sales to Summary DTOs
   */
  static toSummaryDTOArray(sales: SaleWithRelations[]): SaleSummaryDTO[] {
    return sales.map(sale => this.toSummaryDTO(sale))
  }
}
