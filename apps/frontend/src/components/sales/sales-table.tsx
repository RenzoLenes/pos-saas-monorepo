"use client"

import React, { useState, useMemo } from 'react'
import type { SaleDTO, SaleItemDTO } from 'shared-types'

type Sale = SaleDTO
type SaleItem = SaleItemDTO
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { useSales } from '@/hooks/api/use-sales'
import { useOutlets } from '@/hooks/api/use-outlets'
import { formatCurrency } from '@/lib/utils'
import { 
  Receipt, 
  Search, 
  Filter, 
  Eye,
  DollarSign,
  CreditCard,
  Calculator,
  User,
  Store,
  Calendar,
  Wifi,
  WifiOff,
  RefreshCw,
  Clock
} from 'lucide-react'

export function SalesTable() {
  const [searchQuery, setSearchQuery] = useState('')
  const [outletFilter, setOutletFilter] = useState<string>('')
  const [paymentFilter, setPaymentFilter] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [dateFilter, setDateFilter] = useState<string>('')
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null)
  const [showSaleModal, setShowSaleModal] = useState(false)
  
  // Fetch real data from APIs
  const { data: sales = [], isLoading: isLoadingSales, error: salesError } = useSales({
    limit: 100,
  })

  const { data: outlets = [], error: outletsError } = useOutlets()

  // Debug logging
  if (salesError) {
    console.error('Error loading sales:', salesError)
  }
  if (outletsError) {
    console.error('Error loading outlets:', outletsError)
  }

  const filteredSales = sales.filter(sale => {
    const matchesSearch =
      (sale?.saleNumber && sale.saleNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (sale?.customerName && sale.customerName.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesOutlet = !outletFilter || outletFilter === 'all' || sale?.outletId === outletFilter
    const matchesPayment = !paymentFilter || paymentFilter === 'all' || sale?.paymentMethod === paymentFilter
    const matchesStatus = !statusFilter || statusFilter === 'all' ||
      (statusFilter === 'completed' && sale?.status === 'completed') ||
      (statusFilter === 'cancelled' && sale?.status === 'cancelled') ||
      (statusFilter === 'pending' && sale?.status === 'pending')

    const matchesDate = !dateFilter ||
      (sale?.createdAt && new Date(sale.createdAt).toDateString() === new Date(dateFilter).toDateString())

    return matchesSearch && matchesOutlet && matchesPayment && matchesStatus && matchesDate
  })

  // ✅ Optimized: Single iteration instead of 4 separate filter().reduce()
  const salesMetrics = useMemo(() => {
    return sales.reduce((metrics, sale) => {
      const amount = Number(sale.total)

      // Total
      metrics.totalSales += amount

      // By payment method
      if (sale.paymentMethod === 'cash') {
        metrics.totalCash += amount
      } else if (sale.paymentMethod === 'card') {
        metrics.totalCard += amount
      }

      // Pending count
      if (sale.status === 'pending') {
        metrics.pendingSales++
      }

      return metrics
    }, {
      totalSales: 0,
      totalCash: 0,
      totalCard: 0,
      pendingSales: 0
    })
  }, [sales])

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

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'cash': return DollarSign
      case 'card': return CreditCard
      case 'mixed': return Calculator
      default: return DollarSign
    }
  }

  const getPaymentMethodColor = (method: string) => {
    switch (method) {
      case 'cash': return 'text-green-600 bg-green-100'
      case 'card': return 'text-blue-600 bg-blue-100'
      case 'mixed': return 'text-purple-600 bg-purple-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold">Historial de Ventas</h1>
          <p className="text-gray-600">Consulta y gestiona todas las transacciones</p>
        </div>
        <Button variant="outline" className="flex items-center">
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualizar
        </Button>
      </motion.div>

      {/* Loading State */}
      {isLoadingSales ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
      ) : salesError ? (
        <div className="text-center py-12">
          <Receipt className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error al cargar ventas</h3>
          <p className="text-gray-600">{salesError.message}</p>
          <p className="text-sm text-gray-500 mt-2">Asegúrate de estar autenticado y tener permisos</p>
        </div>
      ) : (
        <>

      {/* Stats Cards */}
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
                  <p className="text-sm font-medium text-gray-600">Total Ventas</p>
                  <p className="text-2xl font-bold">{formatCurrency(salesMetrics.totalSales)}</p>
                </div>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Receipt className="h-6 w-6 text-blue-600" />
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
                  <p className="text-sm font-medium text-gray-600">Ventas Efectivo</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(salesMetrics.totalCash)}</p>
                </div>
                <div className="p-2 bg-green-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-green-600" />
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
                  <p className="text-sm font-medium text-gray-600">Ventas Tarjeta</p>
                  <p className="text-2xl font-bold text-blue-600">{formatCurrency(salesMetrics.totalCard)}</p>
                </div>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <CreditCard className="h-6 w-6 text-blue-600" />
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
                  <p className="text-sm font-medium text-gray-600">Ventas Pendientes</p>
                  <p className="text-2xl font-bold text-orange-600">{salesMetrics.pendingSales}</p>
                </div>
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Filtros de Búsqueda
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar ventas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={outletFilter} onValueChange={setOutletFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los outlets" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los outlets</SelectItem>
                  {outlets.map(outlet => (
                    <SelectItem key={outlet.id} value={outlet.id}>{outlet.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Método de pago" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="CASH">Efectivo</SelectItem>
                  <SelectItem value="CARD">Tarjeta</SelectItem>
                  <SelectItem value="MIXED">Mixto</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="completed">Completadas</SelectItem>
                  <SelectItem value="pending">Pendientes</SelectItem>
                  <SelectItem value="cancelled">Canceladas</SelectItem>
                </SelectContent>
              </Select>

              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                placeholder="Fecha"
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Sales Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Transacciones ({filteredSales.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Recibo</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Outlet</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Pago</TableHead>
                  <TableHead>Fecha/Hora</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSales.map((sale) => {
                  if (!sale) return null
                  const PaymentIcon = getPaymentMethodIcon(sale.paymentMethod || 'cash')
                  return (
                    <motion.tr
                      key={sale.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-50"
                    >
                      <TableCell>
                        <div className="flex items-center">
                          <Receipt className="h-4 w-4 text-gray-400 mr-2" />
                          <code className="text-sm font-mono">{sale.saleNumber || 'N/A'}</code>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <User className="h-4 w-4 text-gray-400 mr-2" />
                          <div>
                            <p className="font-medium">
                              {sale.customerName || 'Cliente general'}
                            </p>
                            <p className="text-xs text-gray-500">
                              Cajero
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Store className="h-4 w-4 text-gray-400 mr-2" />
                          <Badge variant="outline" className="text-xs">
                            {outlets.find(o => o.id === sale.outletId)?.name || 'Unknown'}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="font-bold">
                        {formatCurrency(Number(sale.total || 0))}
                      </TableCell>
                      <TableCell>
                        <div className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium ${getPaymentMethodColor(sale.paymentMethod || 'cash')}`}>
                          <PaymentIcon className="h-3 w-3 mr-1" />
                          {sale.paymentMethod || 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 text-gray-400 mr-2" />
                          <div>
                            <p className="text-sm">{sale.createdAt ? new Date(sale.createdAt).toLocaleDateString() : 'N/A'}</p>
                            <p className="text-xs text-gray-500">{sale.createdAt ? new Date(sale.createdAt).toLocaleTimeString() : 'N/A'}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={(sale.status || 'completed').toUpperCase() === 'COMPLETED' ? "success" : (sale.status || 'completed').toUpperCase() === 'CANCELLED' ? "destructive" : "warning"}
                          className="text-xs"
                        >
                          {(sale.status || 'completed').toUpperCase() === 'COMPLETED' ? 'Completada' : (sale.status || 'completed').toUpperCase() === 'CANCELLED' ? 'Cancelada' : 'Pendiente'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedSale(sale as unknown as Sale)
                            setShowSaleModal(true)
                          }}
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                      </TableCell>
                    </motion.tr>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>

      {/* Sale Detail Modal */}
      <Dialog open={showSaleModal} onOpenChange={setShowSaleModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Receipt className="h-5 w-5 mr-2" />
              Detalle de Venta
            </DialogTitle>
          </DialogHeader>
          {selectedSale && (
            <div className="space-y-6">
              {/* Sale Header */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Número de Venta</p>
                  <code className="text-lg font-mono">{selectedSale.saleNumber || 'N/A'}</code>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Fecha y Hora</p>
                  <p className="text-lg">{selectedSale.createdAt ? new Date(selectedSale.createdAt).toLocaleString() : 'N/A'}</p>
                </div>
              </div>

              <Separator />

              {/* Customer & Outlet Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Cliente</p>
                  <p className="text-lg flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    {selectedSale.customerName || 'Cliente general'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Outlet</p>
                  <p className="text-lg flex items-center">
                    <Store className="h-4 w-4 mr-2" />
                    {outlets.find(o => o.id === selectedSale.outletId)?.name || 'Unknown'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Cajero</p>
                  <p className="text-lg">Usuario</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Método de Pago</p>
                  <div className="flex items-center">
                    {React.createElement(getPaymentMethodIcon(selectedSale.paymentMethod || 'cash'), {
                      className: "h-4 w-4 mr-2"
                    })}
                    <span className="text-lg">{selectedSale.paymentMethod || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Items */}
              <div>
                <p className="text-sm font-medium text-gray-600 mb-3">Productos</p>
                <div className="space-y-2">
                  {selectedSale.items?.map((item: SaleItem, index: number) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{item.productName || 'Producto'}</p>
                        <p className="text-sm text-gray-600">
                          {item.quantity} x {formatCurrency(item.unitPrice)}
                        </p>
                      </div>
                      <p className="font-bold">{formatCurrency(item.totalPrice)}</p>
                    </div>
                  )) || (
                    <p className="text-sm text-gray-500">No hay productos en esta venta</p>
                  )}
                </div>
              </div>

              <Separator />

              {/* Totals */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(selectedSale.subtotal || 0)}</span>
                </div>
                {(selectedSale.discount || 0) > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Descuento ({selectedSale.discount}%):</span>
                    <span>-{formatCurrency(((selectedSale.subtotal || 0) * (selectedSale.discount || 0)) / 100)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span>{formatCurrency(selectedSale.total || 0)}</span>
                </div>
              </div>

              {/* Payment Details */}
              {selectedSale.paymentMethod === 'cash' && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex justify-between">
                    <span>Efectivo recibido:</span>
                    <span>{formatCurrency(selectedSale.cashReceived || 0)}</span>
                  </div>
                  {(selectedSale.change || 0) > 0 && (
                    <div className="flex justify-between font-medium">
                      <span>Cambio:</span>
                      <span>{formatCurrency(selectedSale.change || 0)}</span>
                    </div>
                  )}
                </div>
              )}

              {selectedSale.paymentMethod === 'card' && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex justify-between">
                    <span>Monto con tarjeta:</span>
                    <span>{formatCurrency(selectedSale.total || 0)}</span>
                  </div>
                </div>
              )}

              {selectedSale.paymentMethod === 'mixed' && (
                <div className="bg-purple-50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span>Efectivo:</span>
                    <span>{formatCurrency(selectedSale.cashReceived || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tarjeta:</span>
                    <span>{formatCurrency(selectedSale.cardAmount || 0)}</span>
                  </div>
                  {(selectedSale.change || 0) > 0 && (
                    <div className="flex justify-between font-medium">
                      <span>Cambio:</span>
                      <span>{formatCurrency(selectedSale.change || 0)}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Status Info */}
              <div className="flex justify-between items-center pt-4 border-t">
                <div className="flex space-x-2">
                  <Badge 
                    variant={selectedSale.status?.toUpperCase() === 'COMPLETED' ? "success" : selectedSale.status?.toUpperCase() === 'CANCELLED' ? "destructive" : "warning"}
                  >
                    {selectedSale.status?.toUpperCase() === 'COMPLETED' ? 'Completada' : selectedSale.status?.toUpperCase() === 'CANCELLED' ? 'Cancelada' : 'Pendiente'}
                  </Badge>
                </div>
                <Button onClick={() => setShowSaleModal(false)}>
                  Cerrar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
        </>
      )}
    </div>
  )
}