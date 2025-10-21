"use client"

import { useState, useMemo } from 'react'
import type { SaleSummaryDTO, SaleDTO, InventoryDTO, PeriodSummaryDTO } from 'shared-types'
import { calculateDateRange, type TimePeriod } from '@/lib/utils/date-range'
import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useOutlets } from '@/hooks/api/use-outlets'
import { useSales, useSalesSummary } from '@/hooks/api/use-sales'
import { formatCurrency } from '@/lib/utils'
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  Users,
  Package,
  AlertTriangle,
  Calendar,
  Clock,
  Target
} from 'lucide-react'

export function SalesMetrics() {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('today')

  // Get first outlet from tenant (fallback to show data)
  const { data: outlets = [] } = useOutlets()
  const firstOutletId = outlets[0]?.id

  // ✅ Calculate date range using helper - memoized to prevent infinite loop
  const dateRange = useMemo(() => calculateDateRange(timePeriod), [timePeriod])

  // ✅ Fetch optimized summary from backend (DB aggregations)
  const { data: summary, isLoading: isLoadingSummary, error: summaryError } = useSalesSummary({
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
    outletId: firstOutletId
  })

  // ✅ Fetch recent sales for display (only 10 records)
  const { data: recentSales = [] } = useSales({
    outletId: firstOutletId,
    limit: 10
  })

  // ✅ Use summary from backend
  const salesMetrics: PeriodSummaryDTO = summary || {
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
    totalSales: 0,
    totalRevenue: 0,
    averageTicket: 0,
    salesByDay: [],
    salesByPaymentMethod: {
      cash: { count: 0, total: 0 },
      card: { count: 0, total: 0 },
      mixed: { count: 0, total: 0 }
    },
    topProducts: []
  }

  // Log errors for debugging
  if (summaryError) {
    console.error('Sales error:', summaryError)
  }

  // Mock low stock alerts for now
  const lowStockAlerts: InventoryDTO[] = []

  const isLoading = isLoadingSummary || !outlets.length

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!firstOutletId) {
    return (
      <div className="text-center py-12">
        <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No hay Outlets</h3>
        <p className="text-gray-600">Crea un outlet para ver las métricas de ventas</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Time Period Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Métricas de Ventas</h2>
        <Select value={timePeriod} onValueChange={(value) => setTimePeriod(value as TimePeriod)}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Hoy</SelectItem>
            <SelectItem value="week">Esta Semana</SelectItem>
            <SelectItem value="month">Este Mes</SelectItem>
            <SelectItem value="quarter">Este Trimestre</SelectItem>
            <SelectItem value="year">Este Año</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <motion.div variants={item}>
          <MetricCard
            title="Ventas del Período"
            value={formatCurrency(salesMetrics.totalRevenue)}
            change={undefined}
            icon={DollarSign}
            color="blue"
          />
        </motion.div>

        <motion.div variants={item}>
          <MetricCard
            title="Transacciones"
            value={salesMetrics.totalSales.toString()}
            change={undefined}
            icon={ShoppingCart}
            color="green"
          />
        </motion.div>

        <motion.div variants={item}>
          <MetricCard
            title="Pago en Efectivo"
            value={formatCurrency(salesMetrics.salesByPaymentMethod.cash.total)}
            change={undefined}
            icon={Target}
            color="purple"
          />
        </motion.div>

        <motion.div variants={item}>
          <MetricCard
            title="Pago con Tarjeta"
            value={formatCurrency(salesMetrics.salesByPaymentMethod.card.total)}
            change={undefined}
            icon={Users}
            color="orange"
          />
        </motion.div>
      </motion.div>

      {/* Low Stock Alerts */}
      {lowStockAlerts.length > 0 && (
        <motion.div variants={item} className="mt-6">
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center text-orange-800">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Alertas de Inventario ({lowStockAlerts.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {lowStockAlerts.slice(0, 3).map((alert) => (
                  <div key={alert.id} className="flex items-center justify-between p-2 bg-white rounded-md">
                    <div className="flex-1">
                      <p className="font-medium text-sm">Producto ID: {alert.productId}</p>
                      <p className="text-xs text-gray-600">Stock actual: {alert.quantity}</p>
                    </div>
                    <Badge variant="warning" className="ml-2">
                      Bajo stock
                    </Badge>
                  </div>
                ))}
                {lowStockAlerts.length > 3 && (
                  <Button variant="outline" size="sm" className="w-full">
                    Ver todos ({lowStockAlerts.length - 3} más)
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Payment Summary - Simplified */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Methods */}
        <motion.div variants={item}>
          <Card>
            <CardHeader>
              <CardTitle>Distribución de Pagos de Hoy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-blue-500 rounded mr-3"></div>
                    <span>Efectivo</span>
                  </div>
                  <span className="font-semibold">{formatCurrency(salesMetrics.salesByPaymentMethod.cash.total)}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-green-500 rounded mr-3"></div>
                    <span>Tarjeta</span>
                  </div>
                  <span className="font-semibold">{formatCurrency(salesMetrics.salesByPaymentMethod.card.total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Summary Stats */}
        <motion.div variants={item}>
          <Card>
            <CardHeader>
              <CardTitle>Resumen del Día</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <span>Ventas en Efectivo:</span>
                  <span className="font-semibold">{salesMetrics.salesByPaymentMethod.cash.count} transacciones</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <span>Ventas con Tarjeta:</span>
                  <span className="font-semibold">{salesMetrics.salesByPaymentMethod.card.count} transacciones</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <span>Promedio por Venta:</span>
                  <span className="font-semibold">
                    {formatCurrency(salesMetrics.averageTicket)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Sales */}
      {recentSales && recentSales.length > 0 && (
        <motion.div variants={item}>
          <Card>
            <CardHeader>
              <CardTitle>Ventas Recientes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentSales.map((sale) => (
                  <div key={sale.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <ShoppingCart className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">{formatCurrency(Number(sale.total))}</p>
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="h-3 w-3 mr-1" />
                          {new Date(sale.createdAt).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={sale.paymentMethod === 'cash' ? 'success' : 'default'}>
                        {sale.paymentMethod}
                      </Badge>
                      {sale.customerName && (
                        <Badge variant="secondary">
                          {sale.customerName}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
}

function MetricCard({
  title,
  value,
  change,
  icon: Icon,
  color
}: {
  title: string
  value: string
  change?: number
  icon: LucideIcon
  color: 'blue' | 'green' | 'purple' | 'orange'
}) {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-100',
    green: 'text-green-600 bg-green-100',
    purple: 'text-purple-600 bg-purple-100',
    orange: 'text-orange-600 bg-orange-100'
  }

  const isPositiveChange = change && change > 0
  const isNegativeChange = change && change < 0

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
              <Icon className="h-5 w-5" />
            </div>
          </div>
          {change !== undefined && (
            <div className={`flex items-center text-sm ${
              isPositiveChange ? 'text-green-600' : isNegativeChange ? 'text-red-600' : 'text-gray-600'
            }`}>
              {isPositiveChange && <TrendingUp className="h-4 w-4 mr-1" />}
              {isNegativeChange && <TrendingDown className="h-4 w-4 mr-1" />}
              {Math.abs(change)}%
            </div>
          )}
        </div>
        
        <div className="mt-4">
          <h3 className="text-2xl font-bold">{value}</h3>
          <p className="text-sm text-gray-600 mt-1">{title}</p>
        </div>
      </CardContent>
    </Card>
  )
}