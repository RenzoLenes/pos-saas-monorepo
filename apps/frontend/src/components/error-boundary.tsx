'use client'

import React, { Component, type ReactNode } from 'react'
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { logger } from '@/lib/logger'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onReset?: () => void
}

interface State {
  hasError: boolean
  error?: Error
}

/**
 * Error Boundary Component
 * Catches React errors and displays a fallback UI
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to our centralized logger (which sends to Sentry)
    logger.error('Error occurred', {
      componentStack: errorInfo.componentStack,
      errorBoundary: true,
    })
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined })
    this.props.onReset?.()
  }

  handleGoHome = () => {
    window.location.href = '/dashboard'
  }

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
          <Card className="max-w-md w-full">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-6 w-6 text-red-600" />
                <CardTitle className="text-xl">Algo salió mal</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                Lo sentimos, ocurrió un error inesperado. Por favor intenta recargar la página.
              </p>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="p-3 bg-red-50 rounded-md border border-red-200">
                  <p className="text-xs font-mono text-red-800 whitespace-pre-wrap">
                    {this.state.error.message}
                  </p>
                </div>
              )}

              <div className="flex space-x-2">
                <Button
                  onClick={this.handleReset}
                  className="flex-1"
                  variant="outline"
                >
                  <RefreshCcw className="h-4 w-4 mr-2" />
                  Reintentar
                </Button>
                <Button
                  onClick={this.handleGoHome}
                  className="flex-1"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Ir al inicio
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * Lightweight Error Boundary for smaller sections
 */
export function SectionErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      fallback={
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center space-x-2 text-red-800">
            <AlertTriangle className="h-4 w-4" />
            <p className="text-sm font-medium">Error al cargar esta sección</p>
          </div>
          <p className="text-xs text-red-600 mt-1">
            Por favor recarga la página o contacta a soporte si el problema persiste.
          </p>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  )
}
