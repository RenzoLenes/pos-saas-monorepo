import { describe, it, expect, beforeEach } from 'vitest'
import { PriceCalculationService } from '../PriceCalculationService'
import { Money } from '@/domain/value-objects/Money'
import { Discount } from '@/domain/value-objects/Discount'

describe('PriceCalculationService', () => {
  let service: PriceCalculationService

  beforeEach(() => {
    service = new PriceCalculationService()
  })

  describe('calculateWithDiscount', () => {
    it('should calculate price with discount', () => {
      const price = Money.from(100)
      const discount = Discount.from(10)

      const result = service.calculateWithDiscount(price, discount)

      expect(result.getValue()).toBe(90)
    })

    it('should handle zero discount', () => {
      const price = Money.from(100)
      const discount = Discount.none()

      const result = service.calculateWithDiscount(price, discount)

      expect(result.getValue()).toBe(100)
    })

    it('should handle 100% discount', () => {
      const price = Money.from(100)
      const discount = Discount.from(100)

      const result = service.calculateWithDiscount(price, discount)

      expect(result.getValue()).toBe(0)
    })

    it('should handle decimal prices and discounts', () => {
      const price = Money.from(99.99)
      const discount = Discount.from(15)

      const result = service.calculateWithDiscount(price, discount)

      expect(result.getValue()).toBeCloseTo(84.99, 2)
    })
  })

  describe('calculateVolumeDiscount', () => {
    const tiers = [
      { minQuantity: 10, discountPercentage: 5 },
      { minQuantity: 50, discountPercentage: 10 },
      { minQuantity: 100, discountPercentage: 15 },
    ]

    it('should apply no discount below minimum quantity', () => {
      const unitPrice = Money.from(10)
      const result = service.calculateVolumeDiscount(unitPrice, 5, tiers)

      expect(result.finalPrice.getValue()).toBe(50)
      expect(result.appliedDiscount).toBe(0)
    })

    it('should apply 5% discount for 10-49 units', () => {
      const unitPrice = Money.from(10)
      const result = service.calculateVolumeDiscount(unitPrice, 20, tiers)

      expect(result.finalPrice.getValue()).toBe(190) // 200 - 5% = 190
      expect(result.appliedDiscount).toBe(5)
    })

    it('should apply 10% discount for 50-99 units', () => {
      const unitPrice = Money.from(10)
      const result = service.calculateVolumeDiscount(unitPrice, 60, tiers)

      expect(result.finalPrice.getValue()).toBe(540) // 600 - 10% = 540
      expect(result.appliedDiscount).toBe(10)
    })

    it('should apply 15% discount for 100+ units', () => {
      const unitPrice = Money.from(10)
      const result = service.calculateVolumeDiscount(unitPrice, 120, tiers)

      expect(result.finalPrice.getValue()).toBe(1020) // 1200 - 15% = 1020
      expect(result.appliedDiscount).toBe(15)
    })

    it('should apply highest tier at exact threshold', () => {
      const unitPrice = Money.from(10)
      const result = service.calculateVolumeDiscount(unitPrice, 100, tiers)

      expect(result.finalPrice.getValue()).toBe(850) // 1000 - 15% = 850
      expect(result.appliedDiscount).toBe(15)
    })

    it('should handle empty tiers', () => {
      const unitPrice = Money.from(10)
      const result = service.calculateVolumeDiscount(unitPrice, 50, [])

      expect(result.finalPrice.getValue()).toBe(500)
      expect(result.appliedDiscount).toBe(0)
    })
  })

  describe('calculateTax', () => {
    it('should calculate tax when not included in price', () => {
      const amount = Money.from(100)
      const taxConfig = { rate: 16, name: 'IVA', includeInPrice: false }

      const result = service.calculateTax(amount, taxConfig)

      expect(result.getValue()).toBe(16)
    })

    it('should calculate tax when included in price', () => {
      const amount = Money.from(116)
      const taxConfig = { rate: 16, name: 'IVA', includeInPrice: true }

      const result = service.calculateTax(amount, taxConfig)

      expect(result.getValue()).toBeCloseTo(16, 2)
    })

    it('should handle zero tax rate', () => {
      const amount = Money.from(100)
      const taxConfig = { rate: 0, name: 'No Tax', includeInPrice: false }

      const result = service.calculateTax(amount, taxConfig)

      expect(result.getValue()).toBe(0)
    })

    it('should calculate different tax rates', () => {
      const amount = Money.from(100)
      const taxConfig21 = { rate: 21, name: 'IVA', includeInPrice: false }
      const taxConfig10 = { rate: 10, name: 'IVA Reducido', includeInPrice: false }

      const result21 = service.calculateTax(amount, taxConfig21)
      const result10 = service.calculateTax(amount, taxConfig10)

      expect(result21.getValue()).toBe(21)
      expect(result10.getValue()).toBe(10)
    })
  })

  describe('calculateFinalPrice', () => {
    it('should calculate final price with discount and tax', () => {
      const subtotal = Money.from(100)
      const discount = Discount.from(10)
      const taxConfig = { rate: 16, name: 'IVA', includeInPrice: false }

      const result = service.calculateFinalPrice(subtotal, discount, taxConfig)

      expect(result.subtotal.getValue()).toBe(100)
      expect(result.discountAmount.getValue()).toBe(10)
      expect(result.taxAmount.getValue()).toBeCloseTo(14.4, 2) // 16% of 90
      expect(result.total.getValue()).toBeCloseTo(104.4, 2)
      expect(result.effectiveDiscount).toBe(10)
    })

    it('should calculate final price without tax', () => {
      const subtotal = Money.from(100)
      const discount = Discount.from(20)

      const result = service.calculateFinalPrice(subtotal, discount)

      expect(result.subtotal.getValue()).toBe(100)
      expect(result.discountAmount.getValue()).toBe(20)
      expect(result.taxAmount.getValue()).toBe(0)
      expect(result.total.getValue()).toBe(80)
    })

    it('should handle zero discount', () => {
      const subtotal = Money.from(100)
      const discount = Discount.none()
      const taxConfig = { rate: 10, name: 'IVA', includeInPrice: false }

      const result = service.calculateFinalPrice(subtotal, discount, taxConfig)

      expect(result.discountAmount.getValue()).toBe(0)
      expect(result.total.getValue()).toBe(110)
    })

    it('should handle included tax', () => {
      const subtotal = Money.from(116)
      const discount = Discount.none()
      const taxConfig = { rate: 16, name: 'IVA', includeInPrice: true }

      const result = service.calculateFinalPrice(subtotal, discount, taxConfig)

      expect(result.total.getValue()).toBe(116)
      expect(result.taxAmount.getValue()).toBeCloseTo(16, 2)
    })
  })

  describe('calculateCumulativeDiscounts', () => {
    it('should apply multiple discounts sequentially', () => {
      const price = Money.from(100)
      const discounts = [Discount.from(10), Discount.from(10)]

      const result = service.calculateCumulativeDiscounts(price, discounts)

      // First: 100 - 10% = 90
      // Second: 90 - 10% = 81
      expect(result.finalPrice.getValue()).toBeCloseTo(81, 2)
      expect(result.totalDiscountPercentage).toBeCloseTo(19, 2)
    })

    it('should handle single discount', () => {
      const price = Money.from(100)
      const discounts = [Discount.from(20)]

      const result = service.calculateCumulativeDiscounts(price, discounts)

      expect(result.finalPrice.getValue()).toBe(80)
      expect(result.totalDiscountPercentage).toBeCloseTo(20, 10)
    })

    it('should handle empty discounts array', () => {
      const price = Money.from(100)
      const discounts: Discount[] = []

      const result = service.calculateCumulativeDiscounts(price, discounts)

      expect(result.finalPrice.getValue()).toBe(100)
      expect(result.totalDiscountPercentage).toBe(0)
    })

    it('should calculate correct cumulative percentage for multiple discounts', () => {
      const price = Money.from(100)
      const discounts = [Discount.from(20), Discount.from(15), Discount.from(10)]

      const result = service.calculateCumulativeDiscounts(price, discounts)

      // 100 -> 80 -> 68 -> 61.2
      expect(result.finalPrice.getValue()).toBeCloseTo(61.2, 2)
      expect(result.totalDiscountPercentage).toBeCloseTo(38.8, 2)
    })
  })

  describe('roundPrice', () => {
    it('should round to nearest integer', () => {
      expect(service.roundPrice(Money.from(10.4), 'nearest').getValue()).toBe(10)
      expect(service.roundPrice(Money.from(10.5), 'nearest').getValue()).toBe(11)
      expect(service.roundPrice(Money.from(10.6), 'nearest').getValue()).toBe(11)
    })

    it('should round up', () => {
      expect(service.roundPrice(Money.from(10.1), 'up').getValue()).toBe(11)
      expect(service.roundPrice(Money.from(10.9), 'up').getValue()).toBe(11)
      expect(service.roundPrice(Money.from(10), 'up').getValue()).toBe(10)
    })

    it('should round down', () => {
      expect(service.roundPrice(Money.from(10.1), 'down').getValue()).toBe(10)
      expect(service.roundPrice(Money.from(10.9), 'down').getValue()).toBe(10)
      expect(service.roundPrice(Money.from(10), 'down').getValue()).toBe(10)
    })
  })

  describe('calculateWeightedAveragePrice', () => {
    it('should calculate weighted average', () => {
      const items = [
        { price: Money.from(10), quantity: 5 },
        { price: Money.from(20), quantity: 3 },
      ]

      const result = service.calculateWeightedAveragePrice(items)

      // (10*5 + 20*3) / (5+3) = 110 / 8 = 13.75
      expect(result.getValue()).toBeCloseTo(13.75, 2)
    })

    it('should handle single item', () => {
      const items = [{ price: Money.from(15), quantity: 10 }]

      const result = service.calculateWeightedAveragePrice(items)

      expect(result.getValue()).toBe(15)
    })

    it('should return zero for empty items', () => {
      const result = service.calculateWeightedAveragePrice([])

      expect(result.getValue()).toBe(0)
    })

    it('should return zero when total quantity is zero', () => {
      const items = [
        { price: Money.from(10), quantity: 0 },
        { price: Money.from(20), quantity: 0 },
      ]

      const result = service.calculateWeightedAveragePrice(items)

      expect(result.getValue()).toBe(0)
    })
  })

  describe('calculateProfitMargin', () => {
    it('should calculate profit margin correctly', () => {
      const sellingPrice = Money.from(150)
      const cost = Money.from(100)

      const result = service.calculateProfitMargin(sellingPrice, cost)

      expect(result.amount.getValue()).toBe(50)
      expect(result.percentage).toBe(50)
    })

    it('should handle zero cost', () => {
      const sellingPrice = Money.from(100)
      const cost = Money.zero()

      const result = service.calculateProfitMargin(sellingPrice, cost)

      expect(result.amount.getValue()).toBe(100)
      expect(result.percentage).toBe(100)
    })

    it('should calculate low margin', () => {
      const sellingPrice = Money.from(105)
      const cost = Money.from(100)

      const result = service.calculateProfitMargin(sellingPrice, cost)

      expect(result.amount.getValue()).toBe(5)
      expect(result.percentage).toBe(5)
    })

    it('should handle equal selling price and cost', () => {
      const sellingPrice = Money.from(100)
      const cost = Money.from(100)

      const result = service.calculateProfitMargin(sellingPrice, cost)

      expect(result.amount.getValue()).toBe(0)
      expect(result.percentage).toBe(0)
    })
  })

  describe('calculateSellingPrice', () => {
    it('should calculate selling price with desired margin', () => {
      const cost = Money.from(100)
      const margin = 50 // 50%

      const result = service.calculateSellingPrice(cost, margin)

      expect(result.getValue()).toBe(150)
    })

    it('should calculate with zero margin', () => {
      const cost = Money.from(100)

      const result = service.calculateSellingPrice(cost, 0)

      expect(result.getValue()).toBe(100)
    })

    it('should calculate with 100% margin', () => {
      const cost = Money.from(50)

      const result = service.calculateSellingPrice(cost, 100)

      expect(result.getValue()).toBe(100)
    })

    it('should throw error for negative margin', () => {
      const cost = Money.from(100)

      expect(() => {
        service.calculateSellingPrice(cost, -10)
      }).toThrow('El margen de ganancia no puede ser negativo')
    })

    it('should calculate with decimal margin', () => {
      const cost = Money.from(100)

      const result = service.calculateSellingPrice(cost, 33.33)

      expect(result.getValue()).toBeCloseTo(133.33, 2)
    })
  })

  describe('calculateMaxDiscountForMargin', () => {
    it('should calculate maximum discount while maintaining minimum margin', () => {
      const sellingPrice = Money.from(150)
      const cost = Money.from(100)
      const minimumMargin = 20 // 20%

      const result = service.calculateMaxDiscountForMargin(
        sellingPrice,
        cost,
        minimumMargin
      )

      // Minimum selling price = 100 * 1.2 = 120
      // Max discount = 150 - 120 = 30
      // Max discount % = 30/150 = 20%
      expect(result.maxDiscountAmount.getValue()).toBe(30)
      expect(result.maxDiscount.getPercentage()).toBe(20)
    })

    it('should return zero discount when already at minimum margin', () => {
      const sellingPrice = Money.from(120)
      const cost = Money.from(100)
      const minimumMargin = 20

      const result = service.calculateMaxDiscountForMargin(
        sellingPrice,
        cost,
        minimumMargin
      )

      expect(result.maxDiscountAmount.getValue()).toBe(0)
      expect(result.maxDiscount.getPercentage()).toBe(0)
    })

    it('should calculate max discount for different margins', () => {
      const sellingPrice = Money.from(200)
      const cost = Money.from(100)
      const minimumMargin = 50 // 50%

      const result = service.calculateMaxDiscountForMargin(
        sellingPrice,
        cost,
        minimumMargin
      )

      // Minimum selling price = 100 * 1.5 = 150
      // Max discount = 200 - 150 = 50
      // Max discount % = 50/200 = 25%
      expect(result.maxDiscountAmount.getValue()).toBe(50)
      expect(result.maxDiscount.getPercentage()).toBe(25)
    })

    it('should handle zero minimum margin', () => {
      const sellingPrice = Money.from(150)
      const cost = Money.from(100)
      const minimumMargin = 0

      const result = service.calculateMaxDiscountForMargin(
        sellingPrice,
        cost,
        minimumMargin
      )

      // Can discount all profit
      expect(result.maxDiscountAmount.getValue()).toBe(50)
      expect(result.maxDiscount.getPercentage()).toBeCloseTo(33.33, 1)
    })
  })
})
