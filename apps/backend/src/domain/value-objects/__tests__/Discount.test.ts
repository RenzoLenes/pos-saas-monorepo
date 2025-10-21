import { describe, it, expect } from 'vitest'
import { Discount } from '../Discount'
import { Money } from '../Money'

describe('Discount Value Object', () => {
  describe('Creation', () => {
    it('should create a valid discount', () => {
      const discount = Discount.from(10)
      expect(discount.getPercentage()).toBe(10)
    })

    it('should create discount from percentage', () => {
      const discount = Discount.fromPercentage(15)
      expect(discount.getPercentage()).toBe(15)
    })

    it('should create a zero discount', () => {
      const discount = Discount.none()
      expect(discount.getPercentage()).toBe(0)
      expect(discount.isZero()).toBe(true)
    })

    it('should accept 0% discount', () => {
      const discount = Discount.from(0)
      expect(discount.getPercentage()).toBe(0)
    })

    it('should accept 100% discount', () => {
      const discount = Discount.from(100)
      expect(discount.getPercentage()).toBe(100)
    })
  })

  describe('Validation', () => {
    it('should throw error for negative discount', () => {
      expect(() => Discount.from(-1)).toThrow('El descuento debe estar entre 0 y 100')
    })

    it('should throw error for discount greater than 100', () => {
      expect(() => Discount.from(101)).toThrow('El descuento debe estar entre 0 y 100')
    })

    it('should throw error for discount greater than 100 using fromPercentage', () => {
      expect(() => Discount.fromPercentage(150)).toThrow('El descuento debe estar entre 0 y 100')
    })
  })

  describe('Role Authorization', () => {
    it('should allow cashier to apply discount up to 10%', () => {
      const discount = Discount.from(10)
      expect(discount.isAllowedForRole('cashier')).toBe(true)
    })

    it('should not allow cashier to apply discount greater than 10%', () => {
      const discount = Discount.from(15)
      expect(discount.isAllowedForRole('cashier')).toBe(false)
    })

    it('should allow manager to apply any discount', () => {
      const smallDiscount = Discount.from(10)
      const largeDiscount = Discount.from(50)

      expect(smallDiscount.isAllowedForRole('manager')).toBe(true)
      expect(largeDiscount.isAllowedForRole('manager')).toBe(true)
    })

    it('should allow admin to apply any discount', () => {
      const discount = Discount.from(100)
      expect(discount.isAllowedForRole('admin')).toBe(true)
    })
  })

  describe('Application', () => {
    it('should apply discount to money amount using applyTo', () => {
      const discount = Discount.from(10)
      const amount = Money.from(100)
      const result = discount.applyTo(amount)

      expect(result.getValue()).toBe(10) // 10% of 100
    })

    it('should apply discount to money amount using apply', () => {
      const discount = Discount.from(20)
      const amount = Money.from(100)
      const result = discount.apply(amount)

      expect(result.getValue()).toBe(20) // 20% of 100
    })

    it('should calculate correct discount for decimal values', () => {
      const discount = Discount.from(15)
      const amount = Money.from(99.99)
      const result = discount.apply(amount)

      expect(result.getValue()).toBeCloseTo(14.9985, 2)
    })

    it('should return zero when applying zero discount', () => {
      const discount = Discount.none()
      const amount = Money.from(100)
      const result = discount.apply(amount)

      expect(result.getValue()).toBe(0)
    })

    it('should return full amount when applying 100% discount', () => {
      const discount = Discount.from(100)
      const amount = Money.from(100)
      const result = discount.apply(amount)

      expect(result.getValue()).toBe(100)
    })
  })

  describe('State Checks', () => {
    it('should correctly identify zero discount', () => {
      expect(Discount.none().isZero()).toBe(true)
      expect(Discount.from(0).isZero()).toBe(true)
      expect(Discount.from(10).isZero()).toBe(false)
    })
  })

  describe('String Conversion', () => {
    it('should convert to percentage string', () => {
      const discount = Discount.from(15)
      expect(discount.toString()).toBe('15%')
    })

    it('should convert zero discount to string', () => {
      const discount = Discount.none()
      expect(discount.toString()).toBe('0%')
    })

    it('should convert 100% discount to string', () => {
      const discount = Discount.from(100)
      expect(discount.toString()).toBe('100%')
    })
  })

  describe('Complex Scenarios', () => {
    it('should calculate final price after discount', () => {
      const originalPrice = Money.from(250)
      const discount = Discount.from(20)
      const discountAmount = discount.apply(originalPrice)
      const finalPrice = originalPrice.subtract(discountAmount)

      expect(finalPrice.getValue()).toBe(200) // 250 - (20% of 250)
    })

    it('should handle multiple discount calculations', () => {
      const price1 = Money.from(100)
      const price2 = Money.from(200)
      const price3 = Money.from(300)
      const discount = Discount.from(10)

      const total = price1.add(price2).add(price3) // 600
      const discountAmount = discount.apply(total)

      expect(discountAmount.getValue()).toBe(60) // 10% of 600
    })
  })
})
