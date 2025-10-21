/**
 * Inventory Mapper
 * Converts between Prisma models and Inventory DTOs
 */

import type { Inventory, Product, Outlet } from '@prisma/client'
import type { InventoryDTO, InventorySummaryDTO, LowStockItemDTO } from '@/application/dtos'

type InventoryWithRelations = Inventory & {
  product: Product
  outlet: Outlet
}

export class InventoryMapper {
  /**
   * Convert Prisma Inventory to InventoryDTO
   */
  static toDTO(inventory: InventoryWithRelations): InventoryDTO {
    return {
      id: inventory.id,
      productId: inventory.productId,
      productName: inventory.product.name,
      productBarcode: inventory.product.barcode,
      outletId: inventory.outletId,
      outletName: inventory.outlet.name,
      quantity: inventory.quantity,
      minStock: inventory.minStock,
      maxStock: inventory.maxStock
    }
  }

  /**
   * Convert Prisma Inventory to LowStockItemDTO
   */
  static toLowStockDTO(inventory: InventoryWithRelations): LowStockItemDTO {
    const deficit = inventory.minStock - inventory.quantity

    return {
      productId: inventory.productId,
      productName: inventory.product.name,
      productBarcode: inventory.product.barcode,
      outletId: inventory.outletId,
      outletName: inventory.outlet.name,
      currentQuantity: inventory.quantity,
      minStock: inventory.minStock,
      deficit: deficit > 0 ? deficit : 0,
    }
  }

  /**
   * Convert grouped inventory data to InventorySummaryDTO
   */
  static toSummaryDTO(
    productId: string,
    productName: string,
    inventories: InventoryWithRelations[]
  ): InventorySummaryDTO {
    const totalQuantity = inventories.reduce((sum, inv) => sum + inv.quantity, 0)
    const minStock = Math.max(...inventories.map(inv => inv.minStock))

    return {
      productId,
      productName,
      totalQuantity,
      minStock,
      outlets: inventories.map(inv => ({
        outletId: inv.outletId,
        outletName: inv.outlet.name,
        quantity: inv.quantity,
      })),
    }
  }

  /**
   * Convert array of Inventories to DTOs
   */
  static toDTOArray(inventories: InventoryWithRelations[]): InventoryDTO[] {
    return inventories.map(inventory => this.toDTO(inventory))
  }

  /**
   * Convert array of low stock Inventories to DTOs
   */
  static toLowStockDTOArray(inventories: InventoryWithRelations[]): LowStockItemDTO[] {
    return inventories
      .filter(inv => inv.quantity <= inv.minStock)
      .map(inventory => this.toLowStockDTO(inventory))
  }
}
