import { Decimal } from '@prisma/client/runtime/library'

/**
 * Money Value Object
 * Represents monetary values with precision handling
 */
export class Money {
  private readonly amount: Decimal

  private constructor(amount: Decimal) {
    this.amount = amount
  }

  static from(value: number | string | Decimal): Money {
    return new Money(new Decimal(value))
  }

  static zero(): Money {
    return new Money(new Decimal(0))
  }

  add(other: Money): Money {
    return new Money(this.amount.plus(other.amount))
  }

  subtract(other: Money): Money {
    return new Money(this.amount.minus(other.amount))
  }

  multiply(multiplier: number): Money {
    return new Money(this.amount.times(multiplier))
  }

  divide(divisor: number): Money {
    return new Money(this.amount.dividedBy(divisor))
  }

  applyPercentage(percentage: number): Money {
    return new Money(this.amount.times(percentage).dividedBy(100))
  }

  isGreaterThan(other: Money): boolean {
    return this.amount.greaterThan(other.amount)
  }

  isLessThan(other: Money): boolean {
    return this.amount.lessThan(other.amount)
  }

  isGreaterThanOrEqual(other: Money): boolean {
    return this.amount.greaterThanOrEqualTo(other.amount)
  }

  isLessThanOrEqual(other: Money): boolean {
    return this.amount.lessThanOrEqualTo(other.amount)
  }

  equals(other: Money): boolean {
    return this.amount.equals(other.amount)
  }

  isZero(): boolean {
    return this.amount.isZero()
  }

  isPositive(): boolean {
    return this.amount.greaterThan(0)
  }

  isNegative(): boolean {
    return this.amount.lessThan(0)
  }

  isNegativeOrZero(): boolean {
    return this.amount.lessThanOrEqualTo(0)
  }

  getValue(): number {
    return this.amount.toNumber()
  }

  toNumber(): number {
    return this.amount.toNumber()
  }

  toString(): string {
    return this.amount.toFixed(2)
  }

  toDecimal(): Decimal {
    return this.amount
  }
}
