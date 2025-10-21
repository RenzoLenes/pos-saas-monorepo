import { describe, it, expect } from 'vitest'
import { Payment } from '@/domain/entities/Sale'
import { Money } from '../Money'
import { BusinessError, ErrorCodes } from '@/domain/errors'

describe('Payment Value Object', () => {
  describe('Cash Payment Creation', () => {
    it('should create a cash payment', () => {
      const payment = Payment.cash(100, 10)

      expect(payment.method).toBe('cash')
      expect(payment.cashReceived?.getValue()).toBe(100)
      expect(payment.change?.getValue()).toBe(10)
      expect(payment.cardAmount).toBeUndefined()
    })

    it('should create cash payment with zero change', () => {
      const payment = Payment.cash(50, 0)

      expect(payment.method).toBe('cash')
      expect(payment.cashReceived?.getValue()).toBe(50)
      expect(payment.change?.getValue()).toBe(0)
    })

    it('should create cash payment with exact amount', () => {
      const payment = Payment.cash(100.50, 0)

      expect(payment.cashReceived?.getValue()).toBe(100.50)
      expect(payment.change?.getValue()).toBe(0)
    })
  })

  describe('Card Payment Creation', () => {
    it('should create a card payment', () => {
      const payment = Payment.card()

      expect(payment.method).toBe('card')
      expect(payment.cashReceived).toBeUndefined()
      expect(payment.cardAmount).toBeUndefined()
      expect(payment.change).toBeUndefined()
    })
  })

  describe('Mixed Payment Creation', () => {
    it('should create a mixed payment', () => {
      const payment = Payment.mixed(50, 50)

      expect(payment.method).toBe('mixed')
      expect(payment.cashReceived?.getValue()).toBe(50)
      expect(payment.cardAmount?.getValue()).toBe(50)
    })

    it('should create mixed payment with change', () => {
      const payment = Payment.mixed(60, 50, 10)

      expect(payment.method).toBe('mixed')
      expect(payment.cashReceived?.getValue()).toBe(60)
      expect(payment.cardAmount?.getValue()).toBe(50)
      expect(payment.change?.getValue()).toBe(10)
    })

    it('should create mixed payment without change', () => {
      const payment = Payment.mixed(30, 70)

      expect(payment.method).toBe('mixed')
      expect(payment.change).toBeUndefined()
    })
  })

  describe('Payment Validation - Constructor', () => {
    it('should throw error when cash payment missing cashReceived', () => {
      expect(() => {
        new Payment('cash')
      }).toThrow(BusinessError)
      expect(() => {
        new Payment('cash')
      }).toThrow('El pago en efectivo requiere el monto recibido')
    })

    it('should throw error when mixed payment missing cashReceived', () => {
      expect(() => {
        new Payment('mixed', undefined, Money.from(50))
      }).toThrow(BusinessError)
      expect(() => {
        new Payment('mixed', undefined, Money.from(50))
      }).toThrow('El pago mixto requiere montos de efectivo y tarjeta')
    })

    it('should throw error when mixed payment missing cardAmount', () => {
      expect(() => {
        new Payment('mixed', Money.from(50))
      }).toThrow(BusinessError)
    })

    it('should verify error code for invalid payment', () => {
      try {
        new Payment('cash')
        expect.fail('Should have thrown an error')
      } catch (error) {
        expect(error).toBeInstanceOf(BusinessError)
        expect((error as BusinessError).code).toBe(ErrorCodes.BUSINESS_INVALID_PAYMENT)
      }
    })
  })

  describe('Calculate Change', () => {
    it('should calculate change correctly', () => {
      const cashReceived = Money.from(100)
      const total = Money.from(75)
      const change = Payment.calculateChange(cashReceived, total)

      expect(change.getValue()).toBe(25)
    })

    it('should calculate zero change when exact amount', () => {
      const cashReceived = Money.from(100)
      const total = Money.from(100)
      const change = Payment.calculateChange(cashReceived, total)

      expect(change.getValue()).toBe(0)
    })

    it('should throw error when cash received is insufficient', () => {
      const cashReceived = Money.from(50)
      const total = Money.from(100)

      expect(() => {
        Payment.calculateChange(cashReceived, total)
      }).toThrow(BusinessError)
      expect(() => {
        Payment.calculateChange(cashReceived, total)
      }).toThrow('El efectivo recibido es insuficiente')
    })

    it('should calculate change for decimal amounts', () => {
      const cashReceived = Money.from(100)
      const total = Money.from(87.45)
      const change = Payment.calculateChange(cashReceived, total)

      expect(change.getValue()).toBe(12.55)
    })
  })

  describe('Validate Payment', () => {
    it('should validate sufficient cash payment', () => {
      const payment = Payment.cash(100, 10)
      const total = Money.from(90)

      expect(() => payment.validatePayment(total)).not.toThrow()
    })

    it('should throw error for insufficient cash payment', () => {
      const payment = Payment.cash(50, 0)
      const total = Money.from(100)

      expect(() => {
        payment.validatePayment(total)
      }).toThrow(BusinessError)
      expect(() => {
        payment.validatePayment(total)
      }).toThrow(/Efectivo insuficiente/)
    })

    it('should validate card payment without errors', () => {
      const payment = Payment.card()
      const total = Money.from(100)

      expect(() => payment.validatePayment(total)).not.toThrow()
    })

    it('should validate sufficient mixed payment', () => {
      const payment = Payment.mixed(50, 50)
      const total = Money.from(100)

      expect(() => payment.validatePayment(total)).not.toThrow()
    })

    it('should throw error for insufficient mixed payment', () => {
      const payment = Payment.mixed(30, 40)
      const total = Money.from(100)

      expect(() => {
        payment.validatePayment(total)
      }).toThrow(BusinessError)
      expect(() => {
        payment.validatePayment(total)
      }).toThrow('El pago mixto es insuficiente para cubrir el total')
    })

    it('should validate mixed payment with exact amount', () => {
      const payment = Payment.mixed(60, 40)
      const total = Money.from(100)

      expect(() => payment.validatePayment(total)).not.toThrow()
    })

    it('should validate mixed payment with change', () => {
      const payment = Payment.mixed(70, 50, 20)
      const total = Money.from(100)

      expect(() => payment.validatePayment(total)).not.toThrow()
    })
  })

  describe('Complex Scenarios', () => {
    it('should handle cash payment for a large transaction', () => {
      const payment = Payment.cash(1000, 50)
      const total = Money.from(950)

      expect(() => payment.validatePayment(total)).not.toThrow()
      expect(payment.cashReceived?.getValue()).toBe(1000)
      expect(payment.change?.getValue()).toBe(50)
    })

    it('should handle mixed payment with more cash than needed', () => {
      const payment = Payment.mixed(80, 30, 10)
      const total = Money.from(100)

      expect(() => payment.validatePayment(total)).not.toThrow()
    })

    it('should handle payment with decimal values', () => {
      const payment = Payment.cash(100.75, 5.25)
      const total = Money.from(95.50)

      expect(() => payment.validatePayment(total)).not.toThrow()
      expect(payment.cashReceived?.getValue()).toBe(100.75)
    })

    it('should calculate change for real-world scenario', () => {
      // Customer buys $87.65 worth of items, pays with $100
      const cashReceived = Money.from(100)
      const total = Money.from(87.65)
      const change = Payment.calculateChange(cashReceived, total)

      expect(change.getValue()).toBe(12.35)

      const payment = Payment.cash(100, 12.35)
      expect(() => payment.validatePayment(total)).not.toThrow()
    })

    it('should validate mixed payment scenario: customer pays $50 cash + $37.50 card for $87.50 total', () => {
      const payment = Payment.mixed(50, 37.50)
      const total = Money.from(87.50)

      expect(() => payment.validatePayment(total)).not.toThrow()
    })
  })

  describe('Edge Cases', () => {
    it('should handle very small amounts', () => {
      const payment = Payment.cash(1, 0.50)
      const total = Money.from(0.50)

      expect(() => payment.validatePayment(total)).not.toThrow()
    })

    it('should handle zero change', () => {
      const cashReceived = Money.from(100)
      const total = Money.from(100)
      const change = Payment.calculateChange(cashReceived, total)

      expect(change.isZero()).toBe(true)
    })

    it('should handle payment with cents precision', () => {
      const payment = Payment.cash(20.01, 0.01)
      const total = Money.from(20)

      expect(() => payment.validatePayment(total)).not.toThrow()
    })
  })
})
