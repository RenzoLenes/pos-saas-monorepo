'use client'

import { useEffect } from 'react'

interface POSLayoutProps {
  children: React.ReactNode
}

export function POSLayout({ children }: POSLayoutProps) {
  useEffect(() => {
    // Register service worker for offline functionality
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered:', registration)
        })
        .catch((error) => {
          console.log('SW registration failed:', error)
        })
    }

    // Enable background sync (if supported)
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      navigator.serviceWorker.ready.then((registration) => {
        // Check if sync is available on the registration
        if ('sync' in registration) {
          return (registration as any).sync.register('sync-pos-operations')
        }
      }).catch((error) => {
        console.log('Background sync registration failed:', error)
      })
    }

    // Prevent accidental page refresh
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [])

  return (
    <div className="h-screen bg-gray-100">
      {children}
    </div>
  )
}