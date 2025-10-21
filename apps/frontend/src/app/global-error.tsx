'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { logger } from '@/lib/logger'

/**
 * Global Error Handler for Next.js App Router
 * This catches errors in the root layout
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to Sentry
    logger.error('Global error occurred', {
      tags: { digest: error.digest, global: 'true' },
    })
  }, [error])

  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
          <Card className="max-w-md w-full">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-6 w-6 text-red-600" />
                <CardTitle className="text-xl">Error Global</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                Ocurrió un error crítico en la aplicación. Por favor recarga la página.
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

              <Button onClick={reset} className="w-full">
                <RefreshCcw className="h-4 w-4 mr-2" />
                Reintentar
              </Button>
            </CardContent>
          </Card>
        </div>
      </body>
    </html>
  )
}
