"use client"

import { useState } from 'react'
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
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useCustomers, useCreateCustomer } from '@/hooks/api/use-customers'
import { formatCurrency } from '@/lib/utils'
import type { CustomerDTO } from 'shared-types'
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  Edit3, 
  Eye,
  Mail,
  Phone,
  MapPin,
  ShoppingBag,
  Calendar,
  TrendingUp
} from 'lucide-react'

export function CustomerList() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerDTO | null>(null)
  const [showCustomerModal, setShowCustomerModal] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newCustomer, setNewCustomer] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: ''
  })

  // Fetch customers data
  const { data: customers = [], isLoading: isLoadingCustomers, error } = useCustomers()
  const createCustomerMutation = useCreateCustomer()

  // Debug logging
  if (error) {
    console.error('Error loading customers:', error)
  }

  const filteredCustomers = customers.filter(customer => {
    const fullName = `${customer.firstName} ${customer.lastName}`.toLowerCase()
    const matchesSearch = 
      fullName.includes(searchQuery.toLowerCase()) ||
      (customer.email?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
      (customer.phone?.includes(searchQuery) || false)
    
    const matchesStatus = !statusFilter || statusFilter === 'all' || 
      (statusFilter === 'active' && customer.isActive) ||
      (statusFilter === 'inactive' && !customer.isActive)
    
    return matchesSearch && matchesStatus
  })

  const activeCustomers = customers.filter(c => c.isActive).length
  // Note: CustomerDTO doesn't include sales data by default, so these calculations may need adjustment
  const totalRevenue = 0 // Would need to fetch customer sales history separately
  const totalPurchases = 0  // Would need to fetch customer sales history separately
  const avgPurchaseValue = 0 // Would need to fetch customer sales history separately

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

  const handleAddCustomer = async () => {
    try {
      await createCustomerMutation.mutateAsync({
        firstName: newCustomer.firstName,
        lastName: newCustomer.lastName,
        email: newCustomer.email || undefined,
        phone: newCustomer.phone || undefined,
        address: newCustomer.address || undefined,
      })
      setNewCustomer({ firstName: '', lastName: '', email: '', phone: '', address: '' })
      setShowAddModal(false)
    } catch (error) {
      console.error('Error creating customer:', error)
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
          <h1 className="text-3xl font-bold">Clientes</h1>
          <p className="text-gray-600">Gestiona tu base de clientes y su historial</p>
        </div>
        <Button 
          className="flex items-center"
          onClick={() => setShowAddModal(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Agregar Cliente
        </Button>
      </motion.div>

      {/* Loading State */}
      {isLoadingCustomers ? (
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
      ) : error ? (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error al cargar clientes</h3>
          <p className="text-gray-600">{error.message}</p>
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
                  <p className="text-sm font-medium text-gray-600">Total Clientes</p>
                  <p className="text-2xl font-bold">{customers.length}</p>
                </div>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
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
                  <p className="text-sm font-medium text-gray-600">Clientes Activos</p>
                  <p className="text-2xl font-bold text-green-600">{activeCustomers}</p>
                </div>
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-green-600" />
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
                  <p className="text-sm font-medium text-gray-600">Ingresos Totales</p>
                  <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
                </div>
                <div className="p-2 bg-purple-100 rounded-lg">
                  <ShoppingBag className="h-6 w-6 text-purple-600" />
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
                  <p className="text-sm font-medium text-gray-600">Compra Promedio</p>
                  <p className="text-2xl font-bold">{formatCurrency(avgPurchaseValue || 0)}</p>
                </div>
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-orange-600" />
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
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar clientes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Estado del cliente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Activos</SelectItem>
                  <SelectItem value="inactive">Inactivos</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center justify-end">
                <Badge variant="outline">
                  {filteredCustomers.length} cliente{filteredCustomers.length !== 1 ? 's' : ''}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Customers Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Lista de Clientes</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Compras</TableHead>
                  <TableHead>Total Gastado</TableHead>
                  <TableHead>Última Compra</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer) => (
                  <motion.tr
                    key={customer.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50"
                  >
                    <TableCell>
                      <div>
                        <p className="font-medium">{customer.firstName} {customer.lastName}</p>
                        <div className="flex items-center text-xs text-gray-500 mt-1">
                          <MapPin className="h-3 w-3 mr-1" />
                          Cliente desde {new Date(customer.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center text-sm">
                          <Mail className="h-3 w-3 mr-1 text-gray-400" />
                          {customer.email || 'Sin email'}
                        </div>
                        <div className="flex items-center text-sm">
                          <Phone className="h-3 w-3 mr-1 text-gray-400" />
                          {customer.phone || 'Sin teléfono'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-center">
                        <p className="font-medium">0</p>
                        <p className="text-xs text-gray-500">transacciones</p>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(0)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">Sin compras</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={customer.isActive ? "success" : "secondary"}>
                        {customer.isActive ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedCustomer(customer)
                            setShowCustomerModal(true)
                          }}
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit3 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>

      {/* Customer Detail Modal */}
      <Dialog open={showCustomerModal} onOpenChange={setShowCustomerModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalles del Cliente</DialogTitle>
          </DialogHeader>
          {selectedCustomer && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Nombre</Label>
                  <Input value={`${selectedCustomer.firstName} ${selectedCustomer.lastName}`} readOnly />
                </div>
                <div>
                  <Label>Estado</Label>
                  <Select value={selectedCustomer.isActive ? 'active' : 'inactive'}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Activo</SelectItem>
                      <SelectItem value="inactive">Inactivo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Email</Label>
                  <Input value={selectedCustomer.email || ''} />
                </div>
                <div>
                  <Label>Teléfono</Label>
                  <Input value={selectedCustomer.phone || ''} />
                </div>
              </div>

              <div>
                <Label>Dirección</Label>
                <Textarea value={selectedCustomer.address || ''} rows={2} />
              </div>

              {/* Note: CustomerDTO doesn't include sales data by default */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">0</p>
                  <p className="text-sm text-gray-600">Total Compras</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(0)}
                  </p>
                  <p className="text-sm text-gray-600">Total Gastado</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">
                    {formatCurrency(0)}
                  </p>
                  <p className="text-sm text-gray-600">Compra Promedio</p>
                </div>
              </div>

              <div>
                <Label>Información Adicional</Label>
                <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    Cliente registrado el {new Date(selectedCustomer.createdAt).toLocaleDateString()}
                  </p>
                  {selectedCustomer.updatedAt && (
                    <p className="text-sm text-gray-600 mt-1">
                      Última actualización: {new Date(selectedCustomer.updatedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setShowCustomerModal(false)}>
                  Cerrar
                </Button>
                <Button>
                  Guardar Cambios
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Customer Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar Nuevo Cliente</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Nombre</Label>
                <Input 
                  value={newCustomer.firstName}
                  onChange={(e) => setNewCustomer({...newCustomer, firstName: e.target.value})}
                  placeholder="Nombre"
                />
              </div>
              <div>
                <Label>Apellido</Label>
                <Input 
                  value={newCustomer.lastName}
                  onChange={(e) => setNewCustomer({...newCustomer, lastName: e.target.value})}
                  placeholder="Apellido"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Email</Label>
                <Input 
                  type="email"
                  value={newCustomer.email}
                  onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})}
                  placeholder="email@ejemplo.com"
                />
              </div>
              <div>
                <Label>Teléfono</Label>
                <Input 
                  value={newCustomer.phone}
                  onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})}
                  placeholder="+1-555-0123"
                />
              </div>
            </div>

            <div>
              <Label>Dirección</Label>
              <Textarea 
                value={newCustomer.address}
                onChange={(e) => setNewCustomer({...newCustomer, address: e.target.value})}
                placeholder="Dirección completa"
                rows={2}
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setShowAddModal(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddCustomer}>
                Agregar Cliente
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
        </>
      )}
    </div>
  )
}