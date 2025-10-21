import { AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface InlineErrorProps {
  message?: string
  className?: string
}

/**
 * Inline error message component for form fields
 * Used when you want more control than FormMessage provides
 */
export function InlineError({ message, className }: InlineErrorProps) {
  if (!message) {
    return null
  }

  return (
    <div className={cn('flex items-center space-x-1 text-sm text-destructive', className)}>
      <AlertCircle className="h-3 w-3" />
      <span>{message}</span>
    </div>
  )
}
