/**
 * Date range utilities for filtering data by time periods
 */

export type TimePeriod = 'today' | 'week' | 'month' | 'quarter' | 'year'

export interface DateRange {
  startDate: Date
  endDate: Date
}

/**
 * Calculate start and end dates for a given time period
 */
export function calculateDateRange(period: TimePeriod): DateRange {
  const now = new Date()
  const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)
  let startDate: Date

  switch (period) {
    case 'today':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)
      break

    case 'week':
      // Start from Monday of current week
      const dayOfWeek = now.getDay()
      const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1 // If Sunday (0), go back 6 days
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysToMonday, 0, 0, 0, 0)
      break

    case 'month':
      // Start from first day of current month
      startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0)
      break

    case 'quarter':
      // Start from first day of current quarter
      const currentQuarter = Math.floor(now.getMonth() / 3)
      const quarterStartMonth = currentQuarter * 3
      startDate = new Date(now.getFullYear(), quarterStartMonth, 1, 0, 0, 0, 0)
      break

    case 'year':
      // Start from first day of current year
      startDate = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0)
      break

    default:
      // Default to today
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)
  }

  return { startDate, endDate }
}

/**
 * Get a human-readable label for a time period
 */
export function getTimePeriodLabel(period: TimePeriod): string {
  const labels: Record<TimePeriod, string> = {
    today: 'Hoy',
    week: 'Esta Semana',
    month: 'Este Mes',
    quarter: 'Este Trimestre',
    year: 'Este Año'
  }
  return labels[period]
}

/**
 * Format a date range as a human-readable string
 */
export function formatDateRange(startDate: Date, endDate: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }

  const start = startDate.toLocaleDateString('es-ES', options)
  const end = endDate.toLocaleDateString('es-ES', options)

  if (start === end) {
    return start
  }

  return `${start} - ${end}`
}

/**
 * Check if a date falls within a date range
 */
export function isDateInRange(date: Date, startDate: Date, endDate: Date): boolean {
  const time = date.getTime()
  return time >= startDate.getTime() && time <= endDate.getTime()
}

/**
 * Get the previous period for comparison
 */
export function getPreviousPeriod(period: TimePeriod): DateRange {
  const currentRange = calculateDateRange(period)
  const duration = currentRange.endDate.getTime() - currentRange.startDate.getTime()

  return {
    startDate: new Date(currentRange.startDate.getTime() - duration),
    endDate: new Date(currentRange.endDate.getTime() - duration)
  }
}
