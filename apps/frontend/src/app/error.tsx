'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { logger } from '@/lib/logger'

/**
 * Error Handler for Next.js App Router pages
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to console/logging service
    logger.error('Page error occurred', {
      message: error.message,
      digest: error.digest,
      stack: error.stack,
    })
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Card className="max-w-md w-full">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-6 w-6 text-red-600" />
            <CardTitle className="text-xl">Error en la página</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">
            Lo sentimos, ocurrió un error al cargar esta página.
          </p>

          {process.env.NODE_ENV === 'development' && (
            <div className="p-3 bg-red-50 rounded-md border border-red-200">
              <p className="text-xs font-mono text-red-800 whitespace-pre-wrap">
                {error.message}
              </p>
              {error.digest && (
                <p className="text-xs text-red-600 mt-2">
                  Error ID: {error.digest}
                </p>
              )}
            </div>
          )}

          <div className="flex space-x-2">
            <Button onClick={reset} className="flex-1" variant="outline">
              <RefreshCcw className="h-4 w-4 mr-2" />
              Reintentar
            </Button>
            <Button onClick={() => window.location.href = '/dashboard'} className="flex-1">
              <Home className="h-4 w-4 mr-2" />
              Ir al inicio
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
