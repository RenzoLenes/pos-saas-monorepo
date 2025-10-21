import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

interface FormErrorAlertProps {
  title?: string
  errors?: string[]
  className?: string
}

/**
 * Component to display form-level validation errors
 * Useful for displaying multiple errors or general form errors
 */
export function FormErrorAlert({
  title = 'Error de Validación',
  errors = [],
  className,
}: FormErrorAlertProps) {
  if (!errors || errors.length === 0) {
    return null
  }

  return (
    <Alert variant="destructive" className={className}>
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>
        {errors.length === 1 ? (
          <p>{errors[0]}</p>
        ) : (
          <ul className="list-disc list-inside space-y-1">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        )}
      </AlertDescription>
    </Alert>
  )
}

/**
 * Hook to extract form errors for display
 */
import { FieldErrors } from 'react-hook-form'

export function useFormErrors<T extends Record<string, any>>(
  errors: FieldErrors<T>
): string[] {
  return Object.entries(errors)
    .map(([field, error]) => {
      if (error && typeof error === 'object' && 'message' in error) {
        return error.message as string
      }
      return `Error en campo: ${field}`
    })
    .filter(Boolean)
}
