"use client"

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
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
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts'
import { useOutlets } from '@/hooks/api/use-outlets'
import { useSalesSummary, useSales } from '@/hooks/api/use-sales'
import { useProducts } from '@/hooks/api/use-products'
import { formatCurrency } from '@/lib/utils'
import { calculateDateRange, type TimePeriod } from '@/lib/utils/date-range'
import type { PeriodSummaryDTO } from 'shared-types'
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  Download,
  Calendar,
  Filter
} from 'lucide-react'

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']

export function ReportsDashboard() {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('month')
  const [selectedMetric, setSelectedMetric] = useState<string>('sales')

  // Get real data from APIs
  const { data: outlets = [] } = useOutlets()
  const firstOutletId = outlets[0]?.id

  // ✅ Calculate date range using helper - memoized to prevent infinite loop
  const dateRange = useMemo(() => calculateDateRange(timePeriod), [timePeriod])

  // ✅ Fetch optimized summary from backend (DB aggregations)
  const { data: summary, isLoading: isLoadingSummary } = useSalesSummary({
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
    outletId: firstOutletId
  })

  const { data: sales = [] } = useSales({
    outletId: firstOutletId,
    startDate: dateRange.startDate.toISOString(),
    endDate: dateRange.endDate.toISOString(),
    limit: 100
  })

  const { data: products = [] } = useProducts({
    limit: 100
  })

  // ✅ Process real data with useMemo to avoid recalculating on every render
  const reportsData = useMemo(() => {
    // Daily sales aggregation
    const dailySalesMap = new Map<string, { sales: number; transactions: number }>()
    const productsMap = new Map<string, { sales: number; revenue: number }>()
    const paymentMethodsMap = new Map<string, { value: number; amount: number }>()
    const outletsMap = new Map<string, { name: string; sales: number; transactions: number }>()

    // Initialize outlets map
    outlets.forEach(outlet => {
      outletsMap.set(outlet.id, {
        name: outlet.name,
        sales: 0,
        transactions: 0
      })
    })

    // Single iteration through sales
    sales.forEach(sale => {
      const amount = Number(sale.total)
      const date = new Date(sale.createdAt).toISOString().split('T')[0]

      // Daily sales
      const dailyData = dailySalesMap.get(date) || { sales: 0, transactions: 0 }
      dailyData.sales += amount
      dailyData.transactions += 1
      dailySalesMap.set(date, dailyData)

      // Top products
      sale.items?.forEach(item => {
        const productData = productsMap.get(item.productName) || { sales: 0, revenue: 0 }
        productData.sales += item.quantity
        productData.revenue += Number(item.totalPrice)
        productsMap.set(item.productName, productData)
      })

      // Payment methods
      const paymentData = paymentMethodsMap.get(sale.paymentMethod) || { value: 0, amount: 0 }
      paymentData.value += 1
      paymentData.amount += amount
      paymentMethodsMap.set(sale.paymentMethod, paymentData)

      // Outlet performance
      if (outletsMap.has(sale.outletId)) {
        const outletData = outletsMap.get(sale.outletId)!
        outletData.sales += amount
        outletData.transactions += 1
      }
    })

    return {
      dailySales: Array.from(dailySalesMap.entries())
        .map(([date, data]) => ({ date, ...data }))
        .sort((a, b) => a.date.localeCompare(b.date)),

      topProducts: Array.from(productsMap.entries())
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10),

      paymentMethods: Array.from(paymentMethodsMap.entries())
        .map(([name, data]) => ({ name, ...data })),

      outletPerformance: Array.from(outletsMap.values())
        .filter(o => o.transactions > 0)
    }
  }, [sales, outlets])

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

  // ✅ Use summary from backend for key metrics
  const salesMetrics: PeriodSummaryDTO = summary || {
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
    totalRevenue: 0,
    totalSales: 0,
    averageTicket: 0,
    salesByDay: [],
    salesByPaymentMethod: {
      cash: { count: 0, total: 0 },
      card: { count: 0, total: 0 },
      mixed: { count: 0, total: 0 }
    },
    topProducts: []
  }

  const totalSales = salesMetrics.totalRevenue
  const totalTransactions = salesMetrics.totalSales
  const avgTransactionValue = salesMetrics.averageTicket

  const topProduct = reportsData.topProducts[0] || { name: 'N/A', sales: 0 }
  const salesGrowth = 12.5 // Sample growth percentage

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold">Reportes y Analytics</h1>
          <p className="text-gray-600">Analiza el rendimiento de tu negocio</p>
        </div>
        <div className="flex space-x-2">
          <Select value={timePeriod} onValueChange={(value) => setTimePeriod(value as TimePeriod)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Esta Semana</SelectItem>
              <SelectItem value="month">Este Mes</SelectItem>
              <SelectItem value="quarter">Trimestre</SelectItem>
              <SelectItem value="year">Este Año</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="flex items-center">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </motion.div>

      {/* Key Metrics */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
      >
        <motion.div variants={item}>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Ventas Totales</p>
                  <p className="text-2xl font-bold">{formatCurrency(totalSales)}</p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600">+{salesGrowth}%</span>
                  </div>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Transacciones</p>
                  <p className="text-2xl font-bold">{totalTransactions}</p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600">+8.2%</span>
                  </div>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <ShoppingCart className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Ticket Promedio</p>
                  <p className="text-2xl font-bold">{formatCurrency(avgTransactionValue)}</p>
                  <div className="flex items-center mt-2">
                    <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                    <span className="text-sm text-red-600">-2.1%</span>
                  </div>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Producto Top</p>
                  <p className="text-lg font-bold truncate">{topProduct.name}</p>
                  <p className="text-sm text-gray-600">{topProduct.sales} unidades</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Package className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Charts Row 1 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {/* Sales Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Tendencia de Ventas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={reportsData.dailySales}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(value) => new Date(value).toLocaleDateString('es-ES', {
                    month: 'short',
                    day: 'numeric'
                  })}
                />
                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip
                  labelFormatter={(value) => new Date(value).toLocaleDateString('es-ES')}
                  formatter={(value: any) => [formatCurrency(value), 'Ventas']}
                />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="#3B82F6"
                  fillOpacity={1}
                  fill="url(#colorSales)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card>
          <CardHeader>
            <CardTitle>Métodos de Pago</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={reportsData.paymentMethods}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="amount"
                  label={({ name, value }: any) => `${name} ${value}`}
                >
                  {reportsData.paymentMethods.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center space-x-4 mt-4">
              {reportsData.paymentMethods.map((method, index) => (
                <div key={method.name} className="flex items-center">
                  <div
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-sm">{method.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Charts Row 2 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="h-5 w-5 mr-2" />
              Productos Más Vendidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={reportsData.topProducts} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tickFormatter={(value) => value.toString()} />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={120}
                  tickFormatter={(value) => value.length > 15 ? `${value.substring(0, 15)}...` : value}
                />
                <Tooltip
                  formatter={([sales, revenue]: any) => [
                    `${sales} unidades`,
                    `${formatCurrency(revenue)}`
                  ]}
                  labelFormatter={(label) => `Producto: ${label}`}
                />
                <Bar dataKey="sales" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Outlet Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Rendimiento por Outlet</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={reportsData.outletPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip formatter={(value: any) => formatCurrency(value)} />
                <Bar dataKey="sales" fill="#8B5CF6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Detailed Tables */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {/* Top Products Table */}
        <Card>
          <CardHeader>
            <CardTitle>Ranking de Productos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {reportsData.topProducts.map((product, index) => (
                <div key={product.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm
                      ${index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-600' : 'bg-gray-300'}
                    `}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-gray-600">{product.sales} unidades vendidas</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatCurrency(product.revenue)}</p>
                    <Badge variant="secondary" className="text-xs">
                      #{index + 1}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Performance Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Resumen del Período</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">
                    {salesMetrics.salesByPaymentMethod.cash.count + salesMetrics.salesByPaymentMethod.card.count + salesMetrics.salesByPaymentMethod.mixed.count}
                  </p>
                  <p className="text-sm text-gray-600">Total Transacciones</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(avgTransactionValue)}
                  </p>
                  <p className="text-sm text-gray-600">Ticket Promedio</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Pagos en Efectivo</span>
                  <span className="text-sm font-bold">
                    {formatCurrency(salesMetrics.salesByPaymentMethod.cash.total)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Pagos con Tarjeta</span>
                  <span className="text-sm font-bold">
                    {formatCurrency(salesMetrics.salesByPaymentMethod.card.total)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Total Outlets</span>
                  <span className="text-sm">{reportsData.outletPerformance.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Productos Activos</span>
                  <span className="text-sm">{reportsData.topProducts.length}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
