/**
 * SaleNumber Value Object
 * Represents a unique sale number with generation logic
 */
export class SaleNumber {
  private readonly value: string

  private constructor(value: string) {
    this.value = value
  }

  static from(value: string): SaleNumber {
    return new SaleNumber(value)
  }

  /**
   * Generate next sale number based on last sale
   * Format: SALE-YYYYMMDD-XXXX
   */
  static generateNext(lastSale?: { saleNumber: string | null; createdAt: Date }): SaleNumber {
    const today = new Date()
    const dateStr = today.toISOString().split('T')[0].replace(/-/g, '')

    let counter = 1

    if (lastSale?.saleNumber) {
      const lastDate = lastSale.createdAt.toISOString().split('T')[0].replace(/-/g, '')

      if (lastDate === dateStr) {
        const parts = lastSale.saleNumber.split('-')
        if (parts.length === 3) {
          counter = parseInt(parts[2]) + 1
        }
      }
    }

    const counterStr = counter.toString().padStart(4, '0')
    return new SaleNumber(`SALE-${dateStr}-${counterStr}`)
  }

  getValue(): string {
    return this.value
  }

  toString(): string {
    return this.value
  }
}
