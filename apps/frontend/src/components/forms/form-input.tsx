import { forwardRef } from 'react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export interface FormInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string
  label?: string
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ className, error, label, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label
            htmlFor={props.id || props.name}
            className={cn(
              'text-sm font-medium leading-none',
              error && 'text-destructive'
            )}
          >
            {label}
            {props.required && <span className="text-destructive ml-1">*</span>}
          </label>
        )}
        <Input
          ref={ref}
          className={cn(
            error && 'border-destructive focus-visible:ring-destructive',
            className
          )}
          aria-invalid={!!error}
          {...props}
        />
        {error && (
          <p className="text-sm font-medium text-destructive">{error}</p>
        )}
      </div>
    )
  }
)

FormInput.displayName = 'FormInput'
