import { Inventory } from '@/domain/entities/Inventory'

/**
 * Stock Validation Result
 */
export interface StockValidationResult {
  isValid: boolean
  message?: string
  availableStock?: number
  suggestedOutlets?: Array<{
    outletId: string
    outletName?: string
    availableQuantity: number
  }>
}

/**
 * Stock Validation Service
 * Valida disponibilidad de stock y sugiere alternativas
 */
export class StockValidationService {
  /**
   * Valida si hay suficiente stock para una venta
   */
  validateStockForSale(
    inventory: Inventory,
    requestedQuantity: number
  ): StockValidationResult {
    if (requestedQuantity <= 0) {
      return {
        isValid: false,
        message: 'La cantidad solicitada debe ser mayor a cero',
      }
    }

    const canSellResult = inventory.canSell(requestedQuantity)

    if (!canSellResult.canSell) {
      return {
        isValid: false,
        message: canSellResult.message,
        availableStock: inventory.quantity,
      }
    }

    return {
      isValid: true,
      availableStock: inventory.quantity,
    }
  }

  /**
   * Valida stock en múltiples outlets y sugiere alternativas
   */
  validateStockAcrossOutlets(
    inventories: Inventory[],
    requestedQuantity: number,
    preferredOutletId?: string
  ): StockValidationResult {
    if (inventories.length === 0) {
      return {
        isValid: false,
        message: 'No hay inventario disponible para este producto',
      }
    }

    // Buscar en el outlet preferido primero
    if (preferredOutletId) {
      const preferredInventory = inventories.find(
        (inv) => inv.outletId === preferredOutletId
      )

      if (preferredInventory && preferredInventory.hasStock(requestedQuantity)) {
        return {
          isValid: true,
          availableStock: preferredInventory.quantity,
        }
      }
    }

    // Buscar outlets alternativos con stock suficiente
    const outletsWithStock = inventories
      .filter((inv) => inv.hasStock(requestedQuantity))
      .map((inv) => ({
        outletId: inv.outletId,
        availableQuantity: inv.quantity,
      }))

    if (outletsWithStock.length > 0) {
      return {
        isValid: true,
        message: preferredOutletId
          ? 'Stock no disponible en el outlet preferido, pero hay stock en otros outlets'
          : undefined,
        suggestedOutlets: outletsWithStock,
      }
    }

    // Calcular stock total disponible
    const totalStock = inventories.reduce((sum, inv) => sum + inv.quantity, 0)

    if (totalStock >= requestedQuantity) {
      return {
        isValid: false,
        message: `Stock insuficiente en un solo outlet. Stock total disponible: ${totalStock}. Considere dividir el pedido.`,
        availableStock: totalStock,
        suggestedOutlets: inventories
          .filter((inv) => inv.quantity > 0)
          .map((inv) => ({
            outletId: inv.outletId,
            availableQuantity: inv.quantity,
          })),
      }
    }

    return {
      isValid: false,
      message: `Stock insuficiente. Disponible: ${totalStock}, Requerido: ${requestedQuantity}`,
      availableStock: totalStock,
    }
  }

  /**
   * Valida si una transferencia es posible
   */
  validateTransfer(
    sourceInventory: Inventory,
    targetInventory: Inventory,
    quantity: number
  ): StockValidationResult {
    // Validar cantidad
    if (quantity <= 0) {
      return {
        isValid: false,
        message: 'La cantidad a transferir debe ser mayor a cero',
      }
    }

    // Validar mismo producto
    if (sourceInventory.productId !== targetInventory.productId) {
      return {
        isValid: false,
        message: 'Solo se puede transferir entre inventarios del mismo producto',
      }
    }

    // Validar diferentes outlets
    if (sourceInventory.outletId === targetInventory.outletId) {
      return {
        isValid: false,
        message: 'No se puede transferir al mismo outlet',
      }
    }

    // Validar stock disponible
    if (!sourceInventory.hasStock(quantity)) {
      return {
        isValid: false,
        message: `Stock insuficiente para transferir. Disponible: ${sourceInventory.quantity}, Requerido: ${quantity}`,
        availableStock: sourceInventory.quantity,
      }
    }

    return {
      isValid: true,
      availableStock: sourceInventory.quantity,
    }
  }

  /**
   * Calcula tiempo estimado de reabastecimiento (simulado)
   * En un sistema real, esto consultaría órdenes de compra, proveedores, etc.
   */
  estimateRestockTime(inventory: Inventory): {
    needsRestock: boolean
    estimatedDays?: number
    urgency: 'low' | 'medium' | 'high' | 'critical'
  } {
    const stockPercentage = inventory.getStockPercentage()
    const isLow = inventory.isLowStock()
    const isOut = inventory.isOutOfStock()

    if (isOut) {
      return {
        needsRestock: true,
        estimatedDays: 3, // Default: 3 días para restock de emergencia
        urgency: 'critical',
      }
    }

    if (isLow) {
      const urgency =
        stockPercentage <= 25
          ? 'high'
          : stockPercentage <= 50
            ? 'medium'
            : 'low'

      return {
        needsRestock: true,
        estimatedDays: urgency === 'high' ? 5 : 7,
        urgency,
      }
    }

    return {
      needsRestock: false,
      urgency: 'low',
    }
  }

  /**
   * Valida múltiples items para una venta
   */
  validateMultipleItems(
    items: Array<{ inventory: Inventory; requestedQuantity: number }>
  ): {
    isValid: boolean
    invalidItems: Array<{
      productId: string
      message: string
      availableStock: number
    }>
  } {
    const invalidItems: Array<{
      productId: string
      message: string
      availableStock: number
    }> = []

    for (const item of items) {
      const validation = this.validateStockForSale(
        item.inventory,
        item.requestedQuantity
      )

      if (!validation.isValid) {
        invalidItems.push({
          productId: item.inventory.productId,
          message: validation.message || 'Stock insuficiente',
          availableStock: validation.availableStock || 0,
        })
      }
    }

    return {
      isValid: invalidItems.length === 0,
      invalidItems,
    }
  }
}
