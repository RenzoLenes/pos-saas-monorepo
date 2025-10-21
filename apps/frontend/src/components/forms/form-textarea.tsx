import { forwardRef } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

export interface FormTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string
  label?: string
}

export const FormTextarea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(
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
        <Textarea
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

FormTextarea.displayName = 'FormTextarea'
