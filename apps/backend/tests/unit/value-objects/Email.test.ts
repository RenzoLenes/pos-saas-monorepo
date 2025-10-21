import { describe, it, expect } from 'vitest'
import { Email } from '../Email'
import { BusinessError, ErrorCodes } from '@/domain/errors'

describe('Email Value Object', () => {
  describe('Creation', () => {
    it('should create a valid email', () => {
      const email = Email.from('test@example.com')
      expect(email.getValue()).toBe('test@example.com')
    })

    it('should convert email to lowercase', () => {
      const email = Email.from('TEST@EXAMPLE.COM')
      expect(email.getValue()).toBe('test@example.com')
    })

    it('should create email with mixed case', () => {
      const email = Email.from('Test.User@Example.Com')
      expect(email.getValue()).toBe('test.user@example.com')
    })

    it('should accept email with plus sign', () => {
      const email = Email.from('user+tag@example.com')
      expect(email.getValue()).toBe('user+tag@example.com')
    })

    it('should accept email with numbers', () => {
      const email = Email.from('user123@example456.com')
      expect(email.getValue()).toBe('user123@example456.com')
    })

    it('should accept email with hyphens and underscores', () => {
      const email = Email.from('test_user-name@example-domain.com')
      expect(email.getValue()).toBe('test_user-name@example-domain.com')
    })

    it('should accept email with subdomain', () => {
      const email = Email.from('user@mail.example.com')
      expect(email.getValue()).toBe('user@mail.example.com')
    })
  })

  describe('Validation', () => {
    it('should throw error for invalid email format (missing @)', () => {
      expect(() => Email.from('invalidemailexample.com')).toThrow(BusinessError)
      expect(() => Email.from('invalidemailexample.com')).toThrow('El formato del email es inválido')
    })

    it('should throw error for invalid email format (missing domain)', () => {
      expect(() => Email.from('user@')).toThrow(BusinessError)
    })

    it('should throw error for invalid email format (missing local part)', () => {
      expect(() => Email.from('@example.com')).toThrow(BusinessError)
    })

    it('should throw error for invalid email format (missing TLD)', () => {
      expect(() => Email.from('user@example')).toThrow(BusinessError)
    })

    it('should throw error for email with spaces', () => {
      expect(() => Email.from('user name@example.com')).toThrow(BusinessError)
    })

    it('should throw error for empty string', () => {
      expect(() => Email.from('')).toThrow(BusinessError)
    })

    it('should throw error for multiple @ symbols', () => {
      expect(() => Email.from('user@@example.com')).toThrow(BusinessError)
    })

    it('should verify error code is correct', () => {
      try {
        Email.from('invalid-email')
        expect.fail('Should have thrown an error')
      } catch (error) {
        expect(error).toBeInstanceOf(BusinessError)
        expect((error as BusinessError).code).toBe(ErrorCodes.VALIDATION_INVALID_FORMAT)
      }
    })
  })

  describe('Equality', () => {
    it('should consider two identical emails equal', () => {
      const email1 = Email.from('test@example.com')
      const email2 = Email.from('test@example.com')
      expect(email1.equals(email2)).toBe(true)
    })

    it('should consider emails with different case equal', () => {
      const email1 = Email.from('Test@Example.com')
      const email2 = Email.from('test@example.com')
      expect(email1.equals(email2)).toBe(true)
    })

    it('should consider different emails not equal', () => {
      const email1 = Email.from('user1@example.com')
      const email2 = Email.from('user2@example.com')
      expect(email1.equals(email2)).toBe(false)
    })
  })

  describe('Domain Extraction', () => {
    it('should extract domain from email', () => {
      const email = Email.from('user@example.com')
      expect(email.getDomain()).toBe('example.com')
    })

    it('should extract subdomain correctly', () => {
      const email = Email.from('user@mail.example.com')
      expect(email.getDomain()).toBe('mail.example.com')
    })

    it('should extract domain with country code TLD', () => {
      const email = Email.from('user@example.co.uk')
      expect(email.getDomain()).toBe('example.co.uk')
    })
  })

  describe('Local Part Extraction', () => {
    it('should extract local part from email', () => {
      const email = Email.from('testuser@example.com')
      expect(email.getLocalPart()).toBe('testuser')
    })

    it('should extract local part with special characters', () => {
      const email = Email.from('test.user+tag@example.com')
      expect(email.getLocalPart()).toBe('test.user+tag')
    })

    it('should extract local part with numbers', () => {
      const email = Email.from('user123@example.com')
      expect(email.getLocalPart()).toBe('user123')
    })
  })

  describe('String Conversion', () => {
    it('should convert email to string', () => {
      const email = Email.from('test@example.com')
      expect(email.toString()).toBe('test@example.com')
    })

    it('should return lowercase string representation', () => {
      const email = Email.from('TEST@EXAMPLE.COM')
      expect(email.toString()).toBe('test@example.com')
    })
  })

  describe('Edge Cases', () => {
    it('should handle very long email addresses', () => {
      const longLocal = 'a'.repeat(64)
      const email = Email.from(`${longLocal}@example.com`)
      expect(email.getLocalPart()).toBe(longLocal.toLowerCase())
    })

    it('should handle multiple dots in domain', () => {
      const email = Email.from('user@mail.subdomain.example.com')
      expect(email.getDomain()).toBe('mail.subdomain.example.com')
    })
  })
})
