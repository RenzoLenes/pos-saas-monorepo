import { describe, it, expect, beforeEach } from 'vitest'
import { StockValidationService } from '../StockValidationService'
import { Inventory } from '@/domain/entities/Inventory'

describe('StockValidationService', () => {
  let service: StockValidationService

  beforeEach(() => {
    service = new StockValidationService()
  })

  describe('validateStockForSale', () => {
    it('should validate sufficient stock', () => {
      const inventory = Inventory.create('inv1', 'tenant1', 'prod1', 'out1', 100, 10)
      const result = service.validateStockForSale(inventory, 50)

      expect(result.isValid).toBe(true)
      expect(result.availableStock).toBe(100)
      expect(result.message).toBeUndefined()
    })

    it('should reject zero or negative quantity', () => {
      const inventory = Inventory.create('inv1', 'tenant1', 'prod1', 'out1', 100, 10)
      const result = service.validateStockForSale(inventory, 0)

      expect(result.isValid).toBe(false)
      expect(result.message).toBe('La cantidad solicitada debe ser mayor a cero')
    })

    it('should reject insufficient stock', () => {
      const inventory = Inventory.create('inv1', 'tenant1', 'prod1', 'out1', 10, 5)
      const result = service.validateStockForSale(inventory, 20)

      expect(result.isValid).toBe(false)
      expect(result.message).toContain('Stock insuficiente')
      expect(result.availableStock).toBe(10)
    })

    it('should allow exact stock quantity', () => {
      const inventory = Inventory.create('inv1', 'tenant1', 'prod1', 'out1', 50, 10)
      const result = service.validateStockForSale(inventory, 50)

      expect(result.isValid).toBe(true)
      expect(result.availableStock).toBe(50)
    })

    it('should handle single unit stock', () => {
      const inventory = Inventory.create('inv1', 'tenant1', 'prod1', 'out1', 1, 1)
      const result = service.validateStockForSale(inventory, 1)

      expect(result.isValid).toBe(true)
    })
  })

  describe('validateStockAcrossOutlets', () => {
    it('should find stock in preferred outlet', () => {
      const inventories = [
        Inventory.create('inv1', 'tenant1', 'prod1', 'out1', 50, 10),
        Inventory.create('inv2', 'tenant1', 'prod1', 'out2', 30, 10),
      ]

      const result = service.validateStockAcrossOutlets(inventories, 20, 'out1')

      expect(result.isValid).toBe(true)
      expect(result.availableStock).toBe(50)
      expect(result.suggestedOutlets).toBeUndefined()
    })

    it('should suggest alternative outlets when preferred has insufficient stock', () => {
      const inventories = [
        Inventory.create('inv1', 'tenant1', 'prod1', 'out1', 10, 5),
        Inventory.create('inv2', 'tenant1', 'prod1', 'out2', 50, 10),
      ]

      const result = service.validateStockAcrossOutlets(inventories, 30, 'out1')

      expect(result.isValid).toBe(true)
      expect(result.message).toContain('Stock no disponible en el outlet preferido')
      expect(result.suggestedOutlets).toHaveLength(1)
      expect(result.suggestedOutlets![0].outletId).toBe('out2')
    })

    it('should handle empty inventory list', () => {
      const result = service.validateStockAcrossOutlets([], 10)

      expect(result.isValid).toBe(false)
      expect(result.message).toBe('No hay inventario disponible para este producto')
    })

    it('should suggest multiple outlets with sufficient stock', () => {
      const inventories = [
        Inventory.create('inv1', 'tenant1', 'prod1', 'out1', 50, 10),
        Inventory.create('inv2', 'tenant1', 'prod1', 'out2', 60, 10),
        Inventory.create('inv3', 'tenant1', 'prod1', 'out3', 40, 10),
      ]

      const result = service.validateStockAcrossOutlets(inventories, 30)

      expect(result.isValid).toBe(true)
      expect(result.suggestedOutlets).toHaveLength(3)
    })

    it('should handle case where total stock is sufficient but distributed', () => {
      const inventories = [
        Inventory.create('inv1', 'tenant1', 'prod1', 'out1', 10, 5),
        Inventory.create('inv2', 'tenant1', 'prod1', 'out2', 10, 5),
        Inventory.create('inv3', 'tenant1', 'prod1', 'out3', 10, 5),
      ]

      const result = service.validateStockAcrossOutlets(inventories, 25)

      expect(result.isValid).toBe(false)
      expect(result.message).toContain('Stock insuficiente en un solo outlet')
      expect(result.message).toContain('Stock total disponible: 30')
      expect(result.availableStock).toBe(30)
      expect(result.suggestedOutlets).toHaveLength(3)
    })

    it('should reject when total stock is insufficient', () => {
      const inventories = [
        Inventory.create('inv1', 'tenant1', 'prod1', 'out1', 5, 2),
        Inventory.create('inv2', 'tenant1', 'prod1', 'out2', 3, 2),
      ]

      const result = service.validateStockAcrossOutlets(inventories, 10)

      expect(result.isValid).toBe(false)
      expect(result.message).toContain('Stock insuficiente')
      expect(result.availableStock).toBe(8)
    })
  })

  describe('validateTransfer', () => {
    it('should validate a valid transfer', () => {
      const source = Inventory.create('inv1', 'tenant1', 'prod1', 'out1', 50, 10)
      const target = Inventory.create('inv2', 'tenant1', 'prod1', 'out2', 20, 10)

      const result = service.validateTransfer(source, target, 30)

      expect(result.isValid).toBe(true)
      expect(result.availableStock).toBe(50)
    })

    it('should reject zero or negative quantity', () => {
      const source = Inventory.create('inv1', 'tenant1', 'prod1', 'out1', 50, 10)
      const target = Inventory.create('inv2', 'tenant1', 'prod1', 'out2', 20, 10)

      const result = service.validateTransfer(source, target, 0)

      expect(result.isValid).toBe(false)
      expect(result.message).toBe('La cantidad a transferir debe ser mayor a cero')
    })

    it('should reject transfer between different products', () => {
      const source = Inventory.create('inv1', 'tenant1', 'prod1', 'out1', 50, 10)
      const target = Inventory.create('inv2', 'tenant1', 'prod2', 'out2', 20, 10)

      const result = service.validateTransfer(source, target, 10)

      expect(result.isValid).toBe(false)
      expect(result.message).toBe('Solo se puede transferir entre inventarios del mismo producto')
    })

    it('should reject transfer to same outlet', () => {
      const source = Inventory.create('inv1', 'tenant1', 'prod1', 'out1', 50, 10)
      const target = Inventory.create('inv2', 'tenant1', 'prod1', 'out1', 20, 10)

      const result = service.validateTransfer(source, target, 10)

      expect(result.isValid).toBe(false)
      expect(result.message).toBe('No se puede transferir al mismo outlet')
    })

    it('should reject transfer with insufficient stock', () => {
      const source = Inventory.create('inv1', 'tenant1', 'prod1', 'out1', 10, 5)
      const target = Inventory.create('inv2', 'tenant1', 'prod1', 'out2', 20, 10)

      const result = service.validateTransfer(source, target, 15)

      expect(result.isValid).toBe(false)
      expect(result.message).toContain('Stock insuficiente para transferir')
      expect(result.availableStock).toBe(10)
    })

    it('should allow transfer of exact available stock', () => {
      const source = Inventory.create('inv1', 'tenant1', 'prod1', 'out1', 25, 5)
      const target = Inventory.create('inv2', 'tenant1', 'prod1', 'out2', 10, 5)

      const result = service.validateTransfer(source, target, 25)

      expect(result.isValid).toBe(true)
    })
  })

  describe('estimateRestockTime', () => {
    it('should mark as critical when out of stock', () => {
      const inventory = Inventory.create('inv1', 'tenant1', 'prod1', 'out1', 0, 10)

      const result = service.estimateRestockTime(inventory)

      expect(result.needsRestock).toBe(true)
      expect(result.urgency).toBe('critical')
      expect(result.estimatedDays).toBe(3)
    })

    it('should mark as high urgency when stock is 25% or less', () => {
      const inventory = Inventory.create('inv1', 'tenant1', 'prod1', 'out1', 2, 10)

      const result = service.estimateRestockTime(inventory)

      expect(result.needsRestock).toBe(true)
      expect(result.urgency).toBe('high')
      expect(result.estimatedDays).toBe(5)
    })

    it('should mark as medium urgency when stock is 26-50%', () => {
      const inventory = Inventory.create('inv1', 'tenant1', 'prod1', 'out1', 5, 10)

      const result = service.estimateRestockTime(inventory)

      expect(result.needsRestock).toBe(true)
      expect(result.urgency).toBe('medium')
      expect(result.estimatedDays).toBe(7)
    })

    it('should mark as low urgency when stock is above minimum but still low', () => {
      const inventory = Inventory.create('inv1', 'tenant1', 'prod1', 'out1', 10, 10)

      const result = service.estimateRestockTime(inventory)

      expect(result.needsRestock).toBe(true)
      expect(result.urgency).toBe('low')
    })

    it('should not need restock when stock is above minimum', () => {
      const inventory = Inventory.create('inv1', 'tenant1', 'prod1', 'out1', 50, 10)

      const result = service.estimateRestockTime(inventory)

      expect(result.needsRestock).toBe(false)
      expect(result.urgency).toBe('low')
    })
  })

  describe('validateMultipleItems', () => {
    it('should validate all items successfully', () => {
      const items = [
        {
          inventory: Inventory.create('inv1', 'tenant1', 'prod1', 'out1', 100, 10),
          requestedQuantity: 50,
        },
        {
          inventory: Inventory.create('inv2', 'tenant1', 'prod2', 'out1', 80, 10),
          requestedQuantity: 30,
        },
      ]

      const result = service.validateMultipleItems(items)

      expect(result.isValid).toBe(true)
      expect(result.invalidItems).toHaveLength(0)
    })

    it('should identify invalid items', () => {
      const items = [
        {
          inventory: Inventory.create('inv1', 'tenant1', 'prod1', 'out1', 100, 10),
          requestedQuantity: 50,
        },
        {
          inventory: Inventory.create('inv2', 'tenant1', 'prod2', 'out1', 10, 5),
          requestedQuantity: 20,
        },
        {
          inventory: Inventory.create('inv3', 'tenant1', 'prod3', 'out1', 5, 2),
          requestedQuantity: 10,
        },
      ]

      const result = service.validateMultipleItems(items)

      expect(result.isValid).toBe(false)
      expect(result.invalidItems).toHaveLength(2)
      expect(result.invalidItems[0].productId).toBe('prod2')
      expect(result.invalidItems[1].productId).toBe('prod3')
    })

    it('should handle empty items list', () => {
      const result = service.validateMultipleItems([])

      expect(result.isValid).toBe(true)
      expect(result.invalidItems).toHaveLength(0)
    })

    it('should provide detailed error information for each invalid item', () => {
      const items = [
        {
          inventory: Inventory.create('inv1', 'tenant1', 'prod1', 'out1', 5, 2),
          requestedQuantity: 10,
        },
      ]

      const result = service.validateMultipleItems(items)

      expect(result.isValid).toBe(false)
      expect(result.invalidItems).toHaveLength(1)
      expect(result.invalidItems[0].message).toContain('Stock insuficiente')
      expect(result.invalidItems[0].availableStock).toBe(5)
    })
  })
})
