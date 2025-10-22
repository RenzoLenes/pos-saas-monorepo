/**
 * Product Mapper
 * Converts between Prisma models and Product DTOs
 */

import type { Product, Category, Inventory, Outlet } from '@prisma/client'
import type { ProductDTO, ProductSummaryDTO, ProductWithInventoryDTO } from '@/application/dtos'

type ProductWithRelations = Product & {
  category?: Category | null
  inventory?: (Inventory & {
    outlet: Outlet
  })[]
}

export class ProductMapper {
  /**
   * Convert Prisma Product to ProductDTO
   */
  static toDTO(product: ProductWithRelations): ProductDTO {
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      price: Number(product.price),
      barcode: product.barcode,
      sku: product.sku,
      categoryId: product.categoryId,
      categoryName: product.category?.name || null,
      isCustom: product.isCustom,
      tenantId: product.tenantId,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      isActive: product.isActive,
    }
  }

  /**
   * Convert Prisma Product to ProductSummaryDTO (lighter version)
   */
  static toSummaryDTO(product: ProductWithRelations): ProductSummaryDTO {
    return {
      id: product.id,
      name: product.name,
      price: Number(product.price),
      barcode: product.barcode,
      categoryName: product.category?.name || null,
      isCustom: product.isCustom,
    }
  }

  /**
   * Convert Prisma Product to ProductWithInventoryDTO
   */
  static toWithInventoryDTO(product: ProductWithRelations): ProductWithInventoryDTO {
    const baseDTO = this.toDTO(product)

    return {
      ...baseDTO,
      inventory: product.inventory?.map(inv => ({
        outletId: inv.outletId,
        outletName: inv.outlet.name,
        quantity: inv.quantity,
        minStock: inv.minStock,
      })),
    }
  }

  /**
   * Convert array of Products to DTOs
   */
  static toDTOArray(products: ProductWithRelations[]): ProductDTO[] {
    return products.map(product => this.toDTO(product))
  }

  /**
   * Convert array of Products to Summary DTOs
   */
  static toSummaryDTOArray(products: ProductWithRelations[]): ProductSummaryDTO[] {
    return products.map(product => this.toSummaryDTO(product))
  }
}
