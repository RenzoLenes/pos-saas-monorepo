import Dexie, { Table } from 'dexie'
import type { CartDTO, ProductDTO, SaleDTO } from 'shared-types'

// Extended types for offline storage
export interface OfflineCart extends CartDTO {
  syncStatus: 'pending' | 'synced' | 'failed'
  lastModified: Date
}

export interface OfflineSale extends SaleDTO {
  syncStatus: 'pending' | 'synced' | 'failed'
  lastModified: Date
}

export interface OfflineProduct extends ProductDTO {
  cachedAt: Date
}

export interface SyncOperation {
  id?: number
  type: 'create' | 'update' | 'delete'
  entity: 'cart' | 'sale' | 'product' | 'customer'
  entityId: string
  data: any
  timestamp: Date
  retries: number
  error?: string
}

class OfflineDatabase extends Dexie {
  carts!: Table<OfflineCart, string>
  sales!: Table<OfflineSale, string>
  products!: Table<OfflineProduct, string>
  syncOperations!: Table<SyncOperation, number>

  constructor() {
    super('pos-offline-db')

    this.version(1).stores({
      carts: 'id, userId, outletId, status, syncStatus, lastModified',
      sales: 'id, cartId, outletId, syncStatus, lastModified, createdAt',
      products: 'id, categoryId, isActive, cachedAt',
      syncOperations: '++id, type, entity, entityId, timestamp, retries',
    })
  }

  /**
   * Clear all offline data
   */
  async clearAll() {
    await this.carts.clear()
    await this.sales.clear()
    await this.products.clear()
    await this.syncOperations.clear()
  }

  /**
   * Get cart by ID from offline storage
   */
  async getCart(id: string): Promise<OfflineCart | undefined> {
    return await this.carts.get(id)
  }

  /**
   * Save cart to offline storage
   */
  async saveCart(cart: CartDTO, syncStatus: 'pending' | 'synced' = 'pending') {
    const offlineCart: OfflineCart = {
      ...cart,
      syncStatus,
      lastModified: new Date(),
    }
    await this.carts.put(offlineCart)
  }

  /**
   * Get all pending sync operations
   */
  async getPendingSyncOperations(): Promise<SyncOperation[]> {
    return await this.syncOperations.orderBy('timestamp').toArray()
  }

  /**
   * Add a sync operation to the queue
   */
  async addSyncOperation(
    type: SyncOperation['type'],
    entity: SyncOperation['entity'],
    entityId: string,
    data: any
  ) {
    await this.syncOperations.add({
      type,
      entity,
      entityId,
      data,
      timestamp: new Date(),
      retries: 0,
    })
  }

  /**
   * Remove a sync operation from the queue
   */
  async removeSyncOperation(id: number) {
    await this.syncOperations.delete(id)
  }

  /**
   * Update retry count for a sync operation
   */
  async updateSyncOperationRetry(id: number, error: string) {
    const operation = await this.syncOperations.get(id)
    if (operation) {
      await this.syncOperations.update(id, {
        retries: operation.retries + 1,
        error,
      })
    }
  }

  /**
   * Cache products for offline use
   */
  async cacheProducts(products: ProductDTO[]) {
    const offlineProducts: OfflineProduct[] = products.map((product) => ({
      ...product,
      cachedAt: new Date(),
    }))
    await this.products.bulkPut(offlineProducts)
  }

  /**
   * Get cached products
   */
  async getCachedProducts(): Promise<OfflineProduct[]> {
    return await this.products.toArray()
  }

  /**
   * Get offline stats
   */
  async getOfflineStats() {
    const [
      pendingCarts,
      pendingSales,
      cachedProducts,
      pendingOperations,
    ] = await Promise.all([
      this.carts.where('syncStatus').equals('pending').count(),
      this.sales.where('syncStatus').equals('pending').count(),
      this.products.count(),
      this.syncOperations.count(),
    ])

    return {
      pendingCarts,
      pendingSales,
      cachedProducts,
      pendingOperations,
    }
  }
}

// Create singleton instance
export const offlineDB = new OfflineDatabase()

// Helper function to check if offline database is supported
export const isOfflineSupported = (): boolean => {
  return typeof window !== 'undefined' && 'indexedDB' in window
}
