import { Money } from '@/domain/value-objects/Money'
import { Discount } from '@/domain/value-objects/Discount'

/**
 * Volume Discount Tier
 */
export interface VolumeDiscountTier {
  minQuantity: number
  discountPercentage: number
}

/**
 * Tax Configuration
 */
export interface TaxConfig {
  rate: number // Porcentaje de impuesto (ej: 16 para 16%)
  name: string // Nombre del impuesto (ej: "IVA", "IGV")
  includeInPrice?: boolean // Si el impuesto está incluido en el precio
}

/**
 * Price Calculation Result
 */
export interface PriceCalculationResult {
  subtotal: Money
  discountAmount: Money
  taxAmount: Money
  total: Money
  effectiveDiscount?: number // Porcentaje de descuento efectivo aplicado
}

/**
 * Price Calculation Service
 * Maneja cálculos complejos de precios con descuentos, impuestos y promociones
 */
export class PriceCalculationService {
  /**
   * Calcula precio con descuento simple
   */
  calculateWithDiscount(price: Money, discount: Discount): Money {
    const discountAmount = discount.apply(price)
    return price.subtract(discountAmount)
  }

  /**
   * Calcula descuento por volumen
   */
  calculateVolumeDiscount(
    unitPrice: Money,
    quantity: number,
    tiers: VolumeDiscountTier[]
  ): { finalPrice: Money; appliedDiscount: number } {
    // Ordenar tiers por cantidad mínima descendente
    const sortedTiers = [...tiers].sort((a, b) => b.minQuantity - a.minQuantity)

    // Encontrar el tier aplicable
    const applicableTier = sortedTiers.find(
      (tier) => quantity >= tier.minQuantity
    )

    if (!applicableTier) {
      return {
        finalPrice: unitPrice.multiply(quantity),
        appliedDiscount: 0,
      }
    }

    const subtotal = unitPrice.multiply(quantity)
    const discount = Discount.fromPercentage(applicableTier.discountPercentage)
    const discountAmount = discount.apply(subtotal)
    const finalPrice = subtotal.subtract(discountAmount)

    return {
      finalPrice,
      appliedDiscount: applicableTier.discountPercentage,
    }
  }

  /**
   * Calcula impuestos sobre un monto
   */
  calculateTax(amount: Money, taxConfig: TaxConfig): Money {
    if (taxConfig.includeInPrice) {
      // Si el impuesto está incluido, calcular el monto del impuesto
      // Formula: taxAmount = amount - (amount / (1 + taxRate))
      const taxRate = taxConfig.rate / 100
      const amountWithoutTax = amount.divide(1 + taxRate)
      return amount.subtract(amountWithoutTax)
    } else {
      // Si el impuesto no está incluido, agregarlo
      return amount.multiply(taxConfig.rate / 100)
    }
  }

  /**
   * Calcula precio final con descuentos e impuestos
   */
  calculateFinalPrice(
    subtotal: Money,
    discount: Discount,
    taxConfig?: TaxConfig
  ): PriceCalculationResult {
    // Aplicar descuento
    const discountAmount = discount.apply(subtotal)
    const amountAfterDiscount = subtotal.subtract(discountAmount)

    // Calcular impuesto
    let taxAmount = Money.zero()
    let total = amountAfterDiscount

    if (taxConfig) {
      taxAmount = this.calculateTax(amountAfterDiscount, taxConfig)
      if (!taxConfig.includeInPrice) {
        total = amountAfterDiscount.add(taxAmount)
      }
    }

    return {
      subtotal,
      discountAmount,
      taxAmount,
      total,
      effectiveDiscount: discount.getPercentage(),
    }
  }

  /**
   * Calcula descuentos acumulativos (múltiples descuentos aplicados secuencialmente)
   */
  calculateCumulativeDiscounts(
    price: Money,
    discounts: Discount[]
  ): { finalPrice: Money; totalDiscountPercentage: number } {
    let currentPrice = price
    let cumulativeMultiplier = 1

    for (const discount of discounts) {
      const discountAmount = discount.apply(currentPrice)
      currentPrice = currentPrice.subtract(discountAmount)
      cumulativeMultiplier *= 1 - discount.getPercentage() / 100
    }

    const totalDiscountPercentage = (1 - cumulativeMultiplier) * 100

    return {
      finalPrice: currentPrice,
      totalDiscountPercentage,
    }
  }

  /**
   * Redondea un precio según reglas de negocio
   */
  roundPrice(price: Money, roundingRule: 'nearest' | 'up' | 'down' = 'nearest'): Money {
    const value = price.getValue()

    switch (roundingRule) {
      case 'up':
        return Money.from(Math.ceil(value))
      case 'down':
        return Money.from(Math.floor(value))
      case 'nearest':
      default:
        return Money.from(Math.round(value))
    }
  }

  /**
   * Calcula el precio promedio ponderado
   */
  calculateWeightedAveragePrice(
    items: Array<{ price: Money; quantity: number }>
  ): Money {
    if (items.length === 0) {
      return Money.zero()
    }

    let totalValue = Money.zero()
    let totalQuantity = 0

    for (const item of items) {
      const itemValue = item.price.multiply(item.quantity)
      totalValue = totalValue.add(itemValue)
      totalQuantity += item.quantity
    }

    if (totalQuantity === 0) {
      return Money.zero()
    }

    return totalValue.divide(totalQuantity)
  }

  /**
   * Calcula el margen de ganancia
   */
  calculateProfitMargin(
    sellingPrice: Money,
    cost: Money
  ): { amount: Money; percentage: number } {
    if (cost.isZero()) {
      return {
        amount: sellingPrice,
        percentage: 100,
      }
    }

    const profit = sellingPrice.subtract(cost)
    const percentage = (profit.getValue() / cost.getValue()) * 100

    return {
      amount: profit,
      percentage,
    }
  }

  /**
   * Calcula el precio de venta dado un costo y margen deseado
   */
  calculateSellingPrice(cost: Money, desiredMarginPercentage: number): Money {
    if (desiredMarginPercentage < 0) {
      throw new Error('El margen de ganancia no puede ser negativo')
    }

    // Formula: sellingPrice = cost * (1 + marginPercentage/100)
    const multiplier = 1 + desiredMarginPercentage / 100
    return cost.multiply(multiplier)
  }

  /**
   * Calcula descuento máximo permitido manteniendo un margen mínimo
   */
  calculateMaxDiscountForMargin(
    sellingPrice: Money,
    cost: Money,
    minimumMarginPercentage: number
  ): { maxDiscount: Discount; maxDiscountAmount: Money } {
    // Calcular precio mínimo para mantener el margen
    const minimumSellingPrice = this.calculateSellingPrice(
      cost,
      minimumMarginPercentage
    )

    // Calcular descuento máximo
    const maxDiscountAmount = sellingPrice.subtract(minimumSellingPrice)
    const maxDiscountPercentage =
      (maxDiscountAmount.getValue() / sellingPrice.getValue()) * 100

    return {
      maxDiscount: Discount.fromPercentage(Math.max(0, maxDiscountPercentage)),
      maxDiscountAmount,
    }
  }
}
