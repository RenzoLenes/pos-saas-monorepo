import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
  }).format(amount)
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('es-PE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(d)
}

export function generateBarcode(): string {
  return Math.random().toString(36).substring(2, 15).toUpperCase()
}
