import { describe, it, expect, beforeEach } from 'vitest'
import { SaleNumberGenerationService } from '../SaleNumberGenerationService'

describe('SaleNumberGenerationService', () => {
  let service: SaleNumberGenerationService

  beforeEach(() => {
    service = new SaleNumberGenerationService()
  })

  describe('generate', () => {
    it('should generate sale number with correct format', () => {
      const date = new Date(2025, 9, 10) // October 10, 2025
      const saleNumber = service.generate('outlet-123', 42, date)

      expect(saleNumber).toMatch(/^\d{8}-[A-Z0-9]{6}-\d{5}$/)
      expect(saleNumber).toContain('20251010')
    })

    it('should pad sequence with zeros', () => {
      const date = new Date(2025, 0, 1)
      const saleNumber = service.generate('OUT1', 1, date)

      expect(saleNumber).toContain('-00001')
    })

    it('should format outlet code correctly', () => {
      const date = new Date(2025, 0, 1)
      const saleNumber = service.generate('outlet-main', 1, date)

      // Should extract first 6 alphanumeric characters in uppercase
      expect(saleNumber).toContain('OUTLET')
    })

    it('should handle different dates', () => {
      const date1 = new Date(2025, 0, 1) // Jan 1, 2025
      const date2 = new Date(2025, 11, 31) // Dec 31, 2025

      const saleNumber1 = service.generate('OUT1', 1, date1)
      const saleNumber2 = service.generate('OUT1', 1, date2)

      expect(saleNumber1).toContain('20250101')
      expect(saleNumber2).toContain('20251231')
    })

    it('should handle large sequence numbers', () => {
      const date = new Date(2025, 0, 1)
      const saleNumber = service.generate('OUT1', 99999, date)

      expect(saleNumber).toContain('-99999')
    })

    it('should use current date by default', () => {
      const saleNumber = service.generate('OUT1', 1)

      expect(saleNumber).toMatch(/^\d{8}-[A-Z0-9]{6}-\d{5}$/)
    })
  })

  describe('generateShort', () => {
    it('should generate short sale number', () => {
      const saleNumber = service.generateShort('outlet-1', 42)

      expect(saleNumber).toMatch(/^[A-Z0-9]{4}-\d{3}$/)
    })

    it('should pad short sequence with zeros', () => {
      const saleNumber = service.generateShort('OUT1', 5)

      expect(saleNumber).toContain('-005')
    })

    it('should truncate outlet code to 4 characters', () => {
      const saleNumber = service.generateShort('OUTLONGNAME', 1)

      expect(saleNumber).toContain('OUTL')
    })

    it('should handle 3-digit sequence numbers', () => {
      const saleNumber = service.generateShort('OUT1', 999)

      expect(saleNumber).toContain('-999')
    })
  })

  describe('generateWithPrefix', () => {
    it('should add prefix to sale number', () => {
      const date = new Date(2025, 0, 1)
      const saleNumber = service.generateWithPrefix('INV', 'OUT1', 1, date)

      expect(saleNumber.startsWith('INV-')).toBe(true)
      expect(saleNumber).toContain('20250101')
    })

    it('should work with different prefixes', () => {
      const date = new Date(2025, 0, 1)
      const saleNumber1 = service.generateWithPrefix('REC', 'OUT1', 1, date)
      const saleNumber2 = service.generateWithPrefix('TKT', 'OUT1', 1, date)

      expect(saleNumber1.startsWith('REC-')).toBe(true)
      expect(saleNumber2.startsWith('TKT-')).toBe(true)
    })
  })

  describe('extractDate', () => {
    it('should extract date from sale number', () => {
      const originalDate = new Date(2025, 9, 10)
      const saleNumber = service.generate('OUT1', 1, originalDate)
      const extractedDate = service.extractDate(saleNumber)

      expect(extractedDate).toBeTruthy()
      expect(extractedDate!.getFullYear()).toBe(2025)
      expect(extractedDate!.getMonth()).toBe(9) // October (0-indexed)
      expect(extractedDate!.getDate()).toBe(10)
    })

    it('should return null for invalid format', () => {
      expect(service.extractDate('invalid')).toBeNull()
      expect(service.extractDate('12-34-56')).toBeNull()
      expect(service.extractDate('abcd-OUT1-00001')).toBeNull()
    })

    it('should handle various valid sale numbers', () => {
      const date1 = service.extractDate('20250101-OUT001-00001')
      const date2 = service.extractDate('20251231-OUT001-00001')

      expect(date1?.getFullYear()).toBe(2025)
      expect(date2?.getMonth()).toBe(11) // December (0-indexed)
    })
  })

  describe('extractOutletCode', () => {
    it('should extract outlet code from sale number', () => {
      const saleNumber = '20250101-OUT001-00001'
      const outletCode = service.extractOutletCode(saleNumber)

      expect(outletCode).toBe('OUT001')
    })

    it('should return null for invalid format', () => {
      expect(service.extractOutletCode('invalid')).toBeNull()
      expect(service.extractOutletCode('20250101-00001')).toBeNull()
    })

    it('should handle different outlet codes', () => {
      const code1 = service.extractOutletCode('20250101-MAIN01-00001')
      const code2 = service.extractOutletCode('20250101-STORE2-00001')

      expect(code1).toBe('MAIN01')
      expect(code2).toBe('STORE2')
    })
  })

  describe('extractSequence', () => {
    it('should extract sequence from sale number', () => {
      const saleNumber = '20250101-OUT001-00042'
      const sequence = service.extractSequence(saleNumber)

      expect(sequence).toBe(42)
    })

    it('should return null for invalid format', () => {
      expect(service.extractSequence('invalid')).toBeNull()
      expect(service.extractSequence('20250101-OUT001')).toBeNull()
    })

    it('should handle large sequence numbers', () => {
      const sequence = service.extractSequence('20250101-OUT001-99999')

      expect(sequence).toBe(99999)
    })

    it('should handle sequence with leading zeros', () => {
      const sequence = service.extractSequence('20250101-OUT001-00001')

      expect(sequence).toBe(1)
    })
  })

  describe('validate', () => {
    it('should validate correct format', () => {
      const saleNumber = '20250101-OUT001-00001'

      expect(service.validate(saleNumber)).toBe(true)
    })

    it('should reject invalid date format', () => {
      expect(service.validate('2025101-OUT001-00001')).toBe(false)
      expect(service.validate('202501011-OUT001-00001')).toBe(false)
    })

    it('should reject invalid outlet code', () => {
      expect(service.validate('20250101-OU-00001')).toBe(false) // Too short
      expect(service.validate('20250101-OUTLETS-00001')).toBe(false) // Too long
      expect(service.validate('20250101-OUT-X!-00001')).toBe(false) // Invalid chars
    })

    it('should reject invalid sequence', () => {
      expect(service.validate('20250101-OUT001-0001')).toBe(false) // Too short
      expect(service.validate('20250101-OUT001-000001')).toBe(false) // Too long
    })

    it('should accept various valid formats', () => {
      expect(service.validate('20250101-ABCD00-12345')).toBe(true)
      expect(service.validate('20251231-XYZ999-99999')).toBe(true)
    })
  })

  describe('validateShort', () => {
    it('should validate correct short format', () => {
      expect(service.validateShort('OUT1-001')).toBe(true)
    })

    it('should reject invalid outlet code length', () => {
      expect(service.validateShort('OUT-001')).toBe(false) // Too short
      expect(service.validateShort('OUTLET-001')).toBe(false) // Too long
    })

    it('should reject invalid sequence length', () => {
      expect(service.validateShort('OUT1-01')).toBe(false) // Too short
      expect(service.validateShort('OUT1-0001')).toBe(false) // Too long
    })

    it('should accept various valid short formats', () => {
      expect(service.validateShort('ABC1-999')).toBe(true)
      expect(service.validateShort('XYZ0-001')).toBe(true)
    })
  })

  describe('calculateNextSequence', () => {
    it('should increment sequence by 1', () => {
      const nextSequence = service.calculateNextSequence(42)

      expect(nextSequence).toBe(43)
    })

    it('should handle sequence 0', () => {
      const nextSequence = service.calculateNextSequence(0)

      expect(nextSequence).toBe(1)
    })

    it('should handle large sequences', () => {
      const nextSequence = service.calculateNextSequence(99998)

      expect(nextSequence).toBe(99999)
    })
  })

  describe('generateBatch', () => {
    it('should generate multiple sale numbers', () => {
      const date = new Date(2025, 0, 1)
      const saleNumbers = service.generateBatch('OUT1', 1, 5, date)

      expect(saleNumbers).toHaveLength(5)
      expect(saleNumbers[0]).toContain('-00001')
      expect(saleNumbers[1]).toContain('-00002')
      expect(saleNumbers[4]).toContain('-00005')
    })

    it('should handle single sale number', () => {
      const date = new Date(2025, 0, 1)
      const saleNumbers = service.generateBatch('OUT1', 10, 1, date)

      expect(saleNumbers).toHaveLength(1)
      expect(saleNumbers[0]).toContain('-00010')
    })

    it('should generate zero sale numbers for count 0', () => {
      const date = new Date(2025, 0, 1)
      const saleNumbers = service.generateBatch('OUT1', 1, 0, date)

      expect(saleNumbers).toHaveLength(0)
    })

    it('should maintain sequential order', () => {
      const date = new Date(2025, 0, 1)
      const saleNumbers = service.generateBatch('OUT1', 100, 3, date)

      expect(service.extractSequence(saleNumbers[0])).toBe(100)
      expect(service.extractSequence(saleNumbers[1])).toBe(101)
      expect(service.extractSequence(saleNumbers[2])).toBe(102)
    })
  })

  describe('generateWithChecksum', () => {
    it('should generate sale number with checksum', () => {
      const date = new Date(2025, 0, 1)
      const saleNumber = service.generateWithChecksum('OUT1', 1, date)

      const parts = saleNumber.split('-')
      expect(parts).toHaveLength(4)
      expect(parts[3]).toMatch(/^[A-Z0-9]$/)
    })

    it('should generate different checksums for different sale numbers', () => {
      const date = new Date(2025, 0, 1)
      const saleNumber1 = service.generateWithChecksum('OUT1', 1, date)
      const saleNumber2 = service.generateWithChecksum('OUT1', 2, date)

      expect(saleNumber1).not.toBe(saleNumber2)
    })
  })

  describe('verifyChecksum', () => {
    it('should verify valid checksum', () => {
      const date = new Date(2025, 0, 1)
      const saleNumber = service.generateWithChecksum('OUT1', 1, date)

      expect(service.verifyChecksum(saleNumber)).toBe(true)
    })

    it('should reject invalid checksum', () => {
      const date = new Date(2025, 0, 1)
      const validSaleNumber = service.generateWithChecksum('OUT1', 1, date)
      const invalidSaleNumber = validSaleNumber.slice(0, -1) + 'X'

      expect(service.verifyChecksum(invalidSaleNumber)).toBe(false)
    })

    it('should reject malformed sale numbers', () => {
      expect(service.verifyChecksum('20250101-OUT1-00001')).toBe(false)
      expect(service.verifyChecksum('invalid-format')).toBe(false)
    })
  })

  describe('Integration Tests', () => {
    it('should generate, extract, and validate sale number', () => {
      const date = new Date(2025, 9, 10)
      const outletId = 'main-store'
      const sequence = 123

      const saleNumber = service.generate(outletId, sequence, date)

      expect(service.validate(saleNumber)).toBe(true)
      expect(service.extractDate(saleNumber)?.getTime()).toBe(date.getTime())
      expect(service.extractSequence(saleNumber)).toBe(sequence)
    })

    it('should handle complete workflow with checksum', () => {
      const date = new Date(2025, 0, 15)
      const saleNumber = service.generateWithChecksum('STORE1', 500, date)

      expect(service.verifyChecksum(saleNumber)).toBe(true)

      const extractedDate = service.extractDate(saleNumber)
      expect(extractedDate?.getDate()).toBe(15)

      // For checksummed sale numbers, extract the base number first
      const parts = saleNumber.split('-')
      const baseSaleNumber = parts.slice(0, 3).join('-')
      expect(service.extractSequence(baseSaleNumber)).toBe(500)
    })

    it('should generate batch and validate all', () => {
      const date = new Date(2025, 5, 20)
      const batch = service.generateBatch('OUT1', 1, 10, date)

      batch.forEach((saleNumber) => {
        expect(service.validate(saleNumber)).toBe(true)
      })
    })
  })
})
