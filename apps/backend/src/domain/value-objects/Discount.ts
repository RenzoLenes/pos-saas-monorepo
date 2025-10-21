import { Money } from './Money'

/**
 * Discount Value Object
 * Represents a discount with validation
 */
export class Discount {
  private readonly percentage: number

  private constructor(percentage: number) {
    if (percentage < 0 || percentage > 100) {
      throw new Error('El descuento debe estar entre 0 y 100')
    }
    this.percentage = percentage
  }

  static from(percentage: number): Discount {
    return new Discount(percentage)
  }

  static none(): Discount {
    return new Discount(0)
  }

  static fromPercentage(percentage: number): Discount {
    return new Discount(percentage)
  }

  /**
   * Validate if discount is allowed for given user role
   */
  isAllowedForRole(role: string): boolean {
    if (this.percentage > 10 && role === 'cashier') {
      return false
    }
    return true
  }

  /**
   * Apply discount to a money amount
   */
  applyTo(amount: Money): Money {
    return amount.applyPercentage(this.percentage)
  }

  /**
   * Calculate discount amount from a money value
   */
  apply(amount: Money): Money {
    return amount.applyPercentage(this.percentage)
  }

  getPercentage(): number {
    return this.percentage
  }

  isZero(): boolean {
    return this.percentage === 0
  }

  toString(): string {
    return `${this.percentage}%`
  }
}
