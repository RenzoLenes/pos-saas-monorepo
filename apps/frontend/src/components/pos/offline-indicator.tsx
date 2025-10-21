"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { usePOSSelectors } from '@/store/pos-store'
import { useOfflineSync } from '@/hooks/use-offline-sync'
import { cn } from '@/lib/utils'
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  AlertTriangle,
  CheckCircle,
  Loader2
} from 'lucide-react'

interface OfflineIndicatorProps {
  className?: string
  variant?: 'full' | 'icon' | 'badge'
  showSyncButton?: boolean
}

export function OfflineIndicator({ 
  className, 
  variant = 'full',
  showSyncButton = false 
}: OfflineIndicatorProps) {
  const { syncInProgress, pendingOperations, isOnline, triggerSync } = useOfflineSync()

  const getStatusColor = () => {
    if (!isOnline) return 'text-red-500'
    if (syncInProgress) return 'text-blue-500'
    if (pendingOperations > 0) return 'text-orange-500'
    return 'text-green-500'
  }

  const getStatusBadgeVariant = () => {
    if (!isOnline) return 'destructive'
    if (syncInProgress) return 'default'
    if (pendingOperations > 0) return 'warning'
    return 'success'
  }

  const getStatusText = () => {
    if (!isOnline) return 'Offline'
    if (syncInProgress) return 'Sincronizando...'
    if (pendingOperations > 0) return `${pendingOperations} pendiente${pendingOperations > 1 ? 's' : ''}`
    return 'Online'
  }

  const getStatusIcon = () => {
    if (!isOnline) return WifiOff
    if (syncInProgress) return Loader2
    if (pendingOperations > 0) return AlertTriangle
    return CheckCircle
  }

  const handleSync = () => {
    if (!syncInProgress && isOnline) {
      triggerSync()
    }
  }

  if (variant === 'icon') {
    const StatusIcon = getStatusIcon()
    return (
      <motion.div
        initial={false}
        animate={{ 
          rotate: syncInProgress ? 360 : 0,
          scale: syncInProgress ? [1, 1.1, 1] : 1
        }}
        transition={{ 
          rotate: { duration: 1, repeat: syncInProgress ? Infinity : 0, ease: "linear" },
          scale: { duration: 0.5, repeat: syncInProgress ? Infinity : 0 }
        }}
        className={cn("flex items-center", className)}
      >
        <StatusIcon className={cn("h-4 w-4", getStatusColor())} />
      </motion.div>
    )
  }

  if (variant === 'badge') {
    const StatusIcon = getStatusIcon()
    return (
      <Badge 
        variant={getStatusBadgeVariant()} 
        className={cn("flex items-center space-x-1", className)}
      >
        <motion.div
          animate={{ 
            rotate: syncInProgress ? 360 : 0,
          }}
          transition={{ 
            rotate: { duration: 1, repeat: syncInProgress ? Infinity : 0, ease: "linear" }
          }}
        >
          <StatusIcon className="h-3 w-3 mr-1" />
        </motion.div>
        <span>{getStatusText()}</span>
      </Badge>
    )
  }

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <div className="flex items-center space-x-2">
        <motion.div
          initial={false}
          animate={{ 
            rotate: syncInProgress ? 360 : 0,
            scale: syncInProgress ? [1, 1.1, 1] : 1
          }}
          transition={{ 
            rotate: { duration: 1, repeat: syncInProgress ? Infinity : 0, ease: "linear" },
            scale: { duration: 0.5, repeat: syncInProgress ? Infinity : 0 }
          }}
        >
          {React.createElement(getStatusIcon(), { 
            className: cn("h-4 w-4", getStatusColor()) 
          })}
        </motion.div>
        <span className={cn("text-sm font-medium", getStatusColor())}>
          {getStatusText()}
        </span>
      </div>

      {showSyncButton && isOnline && pendingOperations > 0 && (
        <Button
          size="sm"
          variant="outline"
          onClick={handleSync}
          disabled={syncInProgress}
          className="h-6 px-2"
        >
          <RefreshCw className={cn("h-3 w-3 mr-1", syncInProgress && "animate-spin")} />
          Sincronizar
        </Button>
      )}

      {/* Status details for full variant */}
      <StatusDetails 
        isOnline={isOnline}
        syncInProgress={syncInProgress}
        pendingOperations={pendingOperations}
      />
    </div>
  )
}

function StatusDetails({ 
  isOnline, 
  syncInProgress, 
  pendingOperations 
}: {
  isOnline: boolean
  syncInProgress: boolean  
  pendingOperations: number
}) {
  if (!isOnline) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded-md"
      >
        Los datos se guardan localmente
      </motion.div>
    )
  }

  if (syncInProgress) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-md flex items-center"
      >
        <Loader2 className="h-3 w-3 animate-spin mr-1" />
        Sincronizando datos...
      </motion.div>
    )
  }

  if (pendingOperations > 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-md"
      >
        Pendientes de sincronización
      </motion.div>
    )
  }

  return null
}

// Hook for using offline status across components
export function useOfflineStatus() {
  const { syncInProgress, pendingOperations, isOnline } = useOfflineSync()

  return {
    isOnline,
    syncInProgress,
    pendingOperations,
    hasUnsyncedData: pendingOperations > 0,
    canMakeChanges: isOnline || !syncInProgress, // Can make changes offline, but not while syncing
    statusText: isOnline 
      ? (syncInProgress ? 'Sincronizando' : (pendingOperations > 0 ? 'Pendiente' : 'Online'))
      : 'Offline'
  }
}

// Component for showing offline restrictions
export function OfflineRestriction({ 
  children, 
  message = "Esta función no está disponible sin conexión",
  fallback
}: {
  children: React.ReactNode
  message?: string
  fallback?: React.ReactNode
}) {
  const { isOnline } = useOfflineStatus()

  if (!isOnline) {
    return fallback || (
      <div className="text-center p-4 bg-gray-50 rounded-md">
        <WifiOff className="h-8 w-8 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-600">{message}</p>
      </div>
    )
  }

  return <>{children}</>
}