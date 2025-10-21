'use client'

import { useEffect, useState, useCallback } from 'react'
import { usePOSStore } from '@/store/pos-store'
import { offlineDB, isOfflineSupported } from '@/lib/offline-db'
import { cartService } from '@/services/cart.service'
import { salesService } from '@/services/sales.service'
import { toast } from '@/hooks/use-toast'

export function useOfflineSync() {
  const { setIsOnline, setSyncInProgress, setPendingOperations } = usePOSStore()
  const [isSyncing, setIsSyncing] = useState(false)
  const [isSupported, setIsSupported] = useState(false)

  // Check if offline mode is supported
  useEffect(() => {
    setIsSupported(isOfflineSupported())
  }, [])

  // Monitor online/offline status
  useEffect(() => {
    if (!isSupported) return

    const handleOnline = () => {
      setIsOnline(true)
      toast({
        title: 'Conexión restaurada',
        description: 'Sincronizando operaciones pendientes...',
      })
      syncPendingOperations()
    }

    const handleOffline = () => {
      setIsOnline(false)
      toast({
        title: 'Sin conexión',
        description: 'Trabajando en modo offline',
        variant: 'default',
      })
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Set initial status
    setIsOnline(navigator.onLine)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [isSupported, setIsOnline])

  // Sync pending operations
  const syncPendingOperations = useCallback(async () => {
    if (isSyncing || !navigator.onLine || !isSupported) return

    setIsSyncing(true)
    setSyncInProgress(true)

    try {
      const operations = await offlineDB.getPendingSyncOperations()
      setPendingOperations(operations.length)

      if (operations.length === 0) {
        setSyncInProgress(false)
        setIsSyncing(false)
        return
      }

      let successCount = 0
      let failCount = 0

      for (const op of operations) {
        try {
          await processSyncOperation(op)
          await offlineDB.removeSyncOperation(op.id!)
          successCount++
        } catch (error: any) {
          console.error('Error syncing operation:', error)
          await offlineDB.updateSyncOperationRetry(
            op.id!,
            error.message || 'Unknown error'
          )
          failCount++

          // Remove operation if it has failed too many times
          if (op.retries >= 3) {
            await offlineDB.removeSyncOperation(op.id!)
            toast({
              title: 'Operación descartada',
              description: `No se pudo sincronizar después de 3 intentos`,
              variant: 'destructive',
            })
          }
        }
      }

      // Update pending count
      const remaining = await offlineDB.syncOperations.count()
      setPendingOperations(remaining)

      // Show summary
      if (successCount > 0) {
        toast({
          title: 'Sincronización completada',
          description: `${successCount} operaciones sincronizadas${
            failCount > 0 ? `, ${failCount} fallidas` : ''
          }`,
        })
      }
    } catch (error) {
      console.error('Sync error:', error)
      toast({
        title: 'Error de sincronización',
        description: 'No se pudieron sincronizar las operaciones',
        variant: 'destructive',
      })
    } finally {
      setSyncInProgress(false)
      setIsSyncing(false)
    }
  }, [isSyncing, isSupported, setPendingOperations, setSyncInProgress])

  // Process individual sync operation
  const processSyncOperation = async (op: any) => {
    switch (op.entity) {
      case 'cart':
        if (op.type === 'create') {
          await cartService.create(op.data)
        } else if (op.type === 'update') {
          await cartService.addItem(op.entityId, op.data)
        } else if (op.type === 'delete') {
          await cartService.delete(op.entityId)
        }
        break

      case 'sale':
        if (op.type === 'create') {
          await salesService.complete({ id: op.entityId, ...op.data })
        }
        break

      // Add more cases as needed
      default:
        console.warn('Unknown entity type:', op.entity)
    }
  }

  // Manual sync trigger
  const triggerSync = useCallback(() => {
    if (navigator.onLine) {
      syncPendingOperations()
    } else {
      toast({
        title: 'Sin conexión',
        description: 'No se puede sincronizar sin conexión a internet',
        variant: 'destructive',
      })
    }
  }, [syncPendingOperations])

  // Get offline stats
  const getOfflineStats = useCallback(async () => {
    if (!isSupported) return null
    return await offlineDB.getOfflineStats()
  }, [isSupported])

  // Get sync state from store
  const isOnline = usePOSStore((state) => state.isOnline)
  const syncInProgress = usePOSStore((state) => state.syncInProgress)
  const pendingOperations = usePOSStore((state) => state.pendingOperations)

  return {
    syncPendingOperations,
    triggerSync,
    isSyncing,
    isSupported,
    getOfflineStats,
    isOnline,
    syncInProgress,
    pendingOperations,
  }
}

/**
 * Hook for managing offline cart operations
 */
export function useOfflineCart(outletId?: string) {
  const addOfflineCartItem = useCallback(
    async (cartId: string, productData: any) => {
      if (!isOfflineSupported()) {
        throw new Error('Offline mode not supported')
      }

      try {
        // Add to offline DB
        await offlineDB.addSyncOperation(
          'update',
          'cart',
          cartId,
          productData
        )

        toast({
          title: 'Producto agregado (offline)',
          description: 'Se sincronizará cuando haya conexión',
        })
      } catch (error) {
        console.error('Error adding offline cart item:', error)
        throw error
      }
    },
    []
  )

  return {
    addOfflineCartItem,
  }
}
