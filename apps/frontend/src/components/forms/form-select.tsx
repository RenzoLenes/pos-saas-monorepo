import { forwardRef } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

export interface FormSelectProps {
  error?: string
  label?: string
  placeholder?: string
  value?: string
  onValueChange?: (value: string) => void
  options: Array<{ value: string; label: string }>
  disabled?: boolean
  required?: boolean
  name?: string
}

export const FormSelect = forwardRef<HTMLButtonElement, FormSelectProps>(
  ({ error, label, placeholder, options, required, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label
            className={cn(
              'text-sm font-medium leading-none',
              error && 'text-destructive'
            )}
          >
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </label>
        )}
        <Select
          value={props.value}
          onValueChange={props.onValueChange}
          disabled={props.disabled}
        >
          <SelectTrigger
            ref={ref}
            className={cn(error && 'border-destructive')}
            aria-invalid={!!error}
          >
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {error && (
          <p className="text-sm font-medium text-destructive">{error}</p>
        )}
      </div>
    )
  }
)

FormSelect.displayName = 'FormSelect'
