import { describe, it, expect } from 'vitest'
import { Money } from '../Money'
import { Decimal } from '@prisma/client/runtime/library'

describe('Money Value Object', () => {
  describe('Creation', () => {
    it('should create Money from number', () => {
      const money = Money.from(100)
      expect(money.getValue()).toBe(100)
    })

    it('should create Money from string', () => {
      const money = Money.from('100.50')
      expect(money.getValue()).toBe(100.5)
    })

    it('should create Money from Decimal', () => {
      const decimal = new Decimal(100.25)
      const money = Money.from(decimal)
      expect(money.getValue()).toBe(100.25)
    })

    it('should create zero Money', () => {
      const money = Money.zero()
      expect(money.getValue()).toBe(0)
      expect(money.isZero()).toBe(true)
    })
  })

  describe('Arithmetic Operations', () => {
    it('should add two Money values', () => {
      const money1 = Money.from(100)
      const money2 = Money.from(50)
      const result = money1.add(money2)
      expect(result.getValue()).toBe(150)
    })

    it('should subtract two Money values', () => {
      const money1 = Money.from(100)
      const money2 = Money.from(30)
      const result = money1.subtract(money2)
      expect(result.getValue()).toBe(70)
    })

    it('should multiply Money by a number', () => {
      const money = Money.from(100)
      const result = money.multiply(3)
      expect(result.getValue()).toBe(300)
    })

    it('should divide Money by a number', () => {
      const money = Money.from(100)
      const result = money.divide(4)
      expect(result.getValue()).toBe(25)
    })

    it('should apply percentage to Money', () => {
      const money = Money.from(100)
      const result = money.applyPercentage(10)
      expect(result.getValue()).toBe(10)
    })

    it('should handle decimal arithmetic precisely', () => {
      const money1 = Money.from(0.1)
      const money2 = Money.from(0.2)
      const result = money1.add(money2)
      expect(result.getValue()).toBe(0.3)
    })
  })

  describe('Comparison Operations', () => {
    it('should compare if Money is greater than another', () => {
      const money1 = Money.from(100)
      const money2 = Money.from(50)
      expect(money1.isGreaterThan(money2)).toBe(true)
      expect(money2.isGreaterThan(money1)).toBe(false)
    })

    it('should compare if Money is less than another', () => {
      const money1 = Money.from(50)
      const money2 = Money.from(100)
      expect(money1.isLessThan(money2)).toBe(true)
      expect(money2.isLessThan(money1)).toBe(false)
    })

    it('should compare if Money is greater than or equal to another', () => {
      const money1 = Money.from(100)
      const money2 = Money.from(100)
      const money3 = Money.from(50)
      expect(money1.isGreaterThanOrEqual(money2)).toBe(true)
      expect(money1.isGreaterThanOrEqual(money3)).toBe(true)
      expect(money3.isGreaterThanOrEqual(money1)).toBe(false)
    })

    it('should compare if Money is less than or equal to another', () => {
      const money1 = Money.from(50)
      const money2 = Money.from(50)
      const money3 = Money.from(100)
      expect(money1.isLessThanOrEqual(money2)).toBe(true)
      expect(money1.isLessThanOrEqual(money3)).toBe(true)
      expect(money3.isLessThanOrEqual(money1)).toBe(false)
    })

    it('should compare if two Money values are equal', () => {
      const money1 = Money.from(100)
      const money2 = Money.from(100)
      const money3 = Money.from(50)
      expect(money1.equals(money2)).toBe(true)
      expect(money1.equals(money3)).toBe(false)
    })
  })

  describe('State Checks', () => {
    it('should check if Money is zero', () => {
      expect(Money.zero().isZero()).toBe(true)
      expect(Money.from(0).isZero()).toBe(true)
      expect(Money.from(100).isZero()).toBe(false)
    })

    it('should check if Money is positive', () => {
      expect(Money.from(100).isPositive()).toBe(true)
      expect(Money.from(0).isPositive()).toBe(false)
      expect(Money.from(-100).isPositive()).toBe(false)
    })

    it('should check if Money is negative', () => {
      expect(Money.from(-100).isNegative()).toBe(true)
      expect(Money.from(0).isNegative()).toBe(false)
      expect(Money.from(100).isNegative()).toBe(false)
    })

    it('should check if Money is negative or zero', () => {
      expect(Money.from(-100).isNegativeOrZero()).toBe(true)
      expect(Money.from(0).isNegativeOrZero()).toBe(true)
      expect(Money.from(100).isNegativeOrZero()).toBe(false)
    })
  })

  describe('Conversion', () => {
    it('should convert to number via getValue()', () => {
      const money = Money.from(100.50)
      expect(money.getValue()).toBe(100.50)
    })

    it('should convert to number via toNumber()', () => {
      const money = Money.from(100.50)
      expect(money.toNumber()).toBe(100.50)
    })

    it('should convert to string with 2 decimal places', () => {
      const money = Money.from(100.5)
      expect(money.toString()).toBe('100.50')
    })

    it('should convert to Decimal', () => {
      const money = Money.from(100.50)
      const decimal = money.toDecimal()
      expect(decimal).toBeInstanceOf(Decimal)
      expect(decimal.toNumber()).toBe(100.50)
    })
  })

  describe('Immutability', () => {
    it('should not mutate original Money when performing operations', () => {
      const original = Money.from(100)
      const added = original.add(Money.from(50))

      expect(original.getValue()).toBe(100) // Original unchanged
      expect(added.getValue()).toBe(150) // New value
    })

    it('should create new instances for all operations', () => {
      const money = Money.from(100)
      const doubled = money.multiply(2)
      const halved = money.divide(2)

      expect(money.getValue()).toBe(100)
      expect(doubled.getValue()).toBe(200)
      expect(halved.getValue()).toBe(50)
    })
  })
})
