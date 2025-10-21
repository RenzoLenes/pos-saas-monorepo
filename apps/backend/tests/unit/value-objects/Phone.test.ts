import { describe, it, expect } from 'vitest'
import { Phone } from '../Phone'
import { BusinessError, ErrorCodes } from '@/domain/errors'

describe('Phone Value Object', () => {
  describe('Creation', () => {
    it('should create a valid phone number from digits only', () => {
      const phone = Phone.from('1234567')
      expect(phone.getValue()).toBe('1234567')
    })

    it('should create phone from formatted number', () => {
      const phone = Phone.from('(123) 456-7890')
      expect(phone.getValue()).toBe('1234567890')
    })

    it('should strip non-digit characters', () => {
      const phone = Phone.from('+1 (555) 123-4567')
      expect(phone.getValue()).toBe('15551234567')
    })

    it('should accept 7-digit phone number', () => {
      const phone = Phone.from('1234567')
      expect(phone.getValue()).toBe('1234567')
    })

    it('should accept 10-digit phone number', () => {
      const phone = Phone.from('1234567890')
      expect(phone.getValue()).toBe('1234567890')
    })

    it('should accept 11-digit phone number', () => {
      const phone = Phone.from('12345678901')
      expect(phone.getValue()).toBe('12345678901')
    })

    it('should accept 15-digit phone number', () => {
      const phone = Phone.from('123456789012345')
      expect(phone.getValue()).toBe('123456789012345')
    })
  })

  describe('Validation', () => {
    it('should throw error for phone with less than 7 digits', () => {
      expect(() => Phone.from('123456')).toThrow(BusinessError)
      expect(() => Phone.from('123456')).toThrow('El número de teléfono debe tener entre 7 y 15 dígitos')
    })

    it('should throw error for phone with more than 15 digits', () => {
      expect(() => Phone.from('1234567890123456')).toThrow(BusinessError)
    })

    it('should throw error for empty string', () => {
      expect(() => Phone.from('')).toThrow(BusinessError)
    })

    it('should throw error for string with only non-digit characters', () => {
      expect(() => Phone.from('abc-def')).toThrow(BusinessError)
    })

    it('should verify error code is correct', () => {
      try {
        Phone.from('123')
        expect.fail('Should have thrown an error')
      } catch (error) {
        expect(error).toBeInstanceOf(BusinessError)
        expect((error as BusinessError).code).toBe(ErrorCodes.VALIDATION_INVALID_FORMAT)
      }
    })
  })

  describe('Formatting', () => {
    it('should format 10-digit phone number', () => {
      const phone = Phone.from('5551234567')
      expect(phone.getFormatted()).toBe('(555) 123-4567')
    })

    it('should format 11-digit phone number', () => {
      const phone = Phone.from('15551234567')
      expect(phone.getFormatted()).toBe('1 (555) 123-4567')
    })

    it('should return unformatted for 7-digit phone number', () => {
      const phone = Phone.from('1234567')
      expect(phone.getFormatted()).toBe('1234567')
    })

    it('should return unformatted for 8-digit phone number', () => {
      const phone = Phone.from('12345678')
      expect(phone.getFormatted()).toBe('12345678')
    })

    it('should return unformatted for 12-digit phone number', () => {
      const phone = Phone.from('123456789012')
      expect(phone.getFormatted()).toBe('123456789012')
    })

    it('should format phone created with special characters', () => {
      const phone = Phone.from('+1 (555) 123-4567')
      expect(phone.getFormatted()).toBe('1 (555) 123-4567')
    })
  })

  describe('Equality', () => {
    it('should consider two identical phone numbers equal', () => {
      const phone1 = Phone.from('1234567890')
      const phone2 = Phone.from('1234567890')
      expect(phone1.equals(phone2)).toBe(true)
    })

    it('should consider formatted and unformatted same numbers equal', () => {
      const phone1 = Phone.from('(555) 123-4567')
      const phone2 = Phone.from('5551234567')
      expect(phone1.equals(phone2)).toBe(true)
    })

    it('should consider different phone numbers not equal', () => {
      const phone1 = Phone.from('1234567890')
      const phone2 = Phone.from('0987654321')
      expect(phone1.equals(phone2)).toBe(false)
    })

    it('should handle phone numbers with country codes', () => {
      const phone1 = Phone.from('+1-555-123-4567')
      const phone2 = Phone.from('15551234567')
      expect(phone1.equals(phone2)).toBe(true)
    })
  })

  describe('String Conversion', () => {
    it('should convert to string with digits only', () => {
      const phone = Phone.from('(555) 123-4567')
      expect(phone.toString()).toBe('5551234567')
    })

    it('should return getValue() and toString() as same', () => {
      const phone = Phone.from('+1 (555) 123-4567')
      expect(phone.toString()).toBe(phone.getValue())
    })
  })

  describe('Edge Cases', () => {
    it('should handle phone with dots as separators', () => {
      const phone = Phone.from('555.123.4567')
      expect(phone.getValue()).toBe('5551234567')
    })

    it('should handle phone with spaces', () => {
      const phone = Phone.from('555 123 4567')
      expect(phone.getValue()).toBe('5551234567')
    })

    it('should handle mixed separators', () => {
      const phone = Phone.from('+1 (555)-123.4567')
      expect(phone.getValue()).toBe('15551234567')
    })

    it('should handle phone with multiple spaces', () => {
      const phone = Phone.from('  555  123  4567  ')
      expect(phone.getValue()).toBe('5551234567')
    })

    it('should handle international format', () => {
      const phone = Phone.from('+52 55 1234 5678')
      expect(phone.getValue()).toBe('525512345678')
    })
  })

  describe('Real-world Scenarios', () => {
    it('should handle US phone number', () => {
      const phone = Phone.from('+1 (555) 123-4567')
      expect(phone.getValue()).toBe('15551234567')
      expect(phone.getFormatted()).toBe('1 (555) 123-4567')
    })

    it('should handle local phone number without country code', () => {
      const phone = Phone.from('555-1234')
      expect(phone.getValue()).toBe('5551234')
    })

    it('should handle phone numbers from user input with extra characters', () => {
      const phone = Phone.from('Call me at: (555) 123-4567!')
      expect(phone.getValue()).toBe('5551234567')
    })
  })
})
