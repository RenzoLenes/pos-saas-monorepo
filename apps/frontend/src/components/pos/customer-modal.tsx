"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { usePOSStore, usePOSActions } from '@/store/pos-store'
import { useOfflineStatus } from '@/components/pos/offline-indicator'
import { useCustomers, useCreateCustomer } from '@/hooks/api/use-customers'
import { formatCurrency, formatDate } from '@/lib/utils'
import { toast } from '@/hooks/use-toast'
import type { CustomerDTO, SaleDTO } from 'shared-types'

// Type aliases for easier migration
type Customer = CustomerDTO
type Sale = SaleDTO
import {
  User,
  Search,
  Plus,
  Phone,
  Mail,
  MapPin,
  Calendar,
  ShoppingBag,
  Check,
  X,
  Star,
  TrendingUp
} from 'lucide-react'

interface CustomerModalProps {
  open: boolean
  onClose: () => void
  onCustomerSelect?: (customer: Customer) => void
}

export function CustomerModal({ open, onClose, onCustomerSelect }: CustomerModalProps) {
  const [activeTab, setActiveTab] = useState('search')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)

  const { currentCustomer } = usePOSStore()
  const { setCustomer } = usePOSActions()
  const { isOnline } = useOfflineStatus()

  // Get customers from server
  const { data: customers = [], refetch: refetchCustomers } = useCustomers()

  // Get customer sales history - disabled for now
  const customerSales: Sale[] = [] // TODO: Implement when API is ready

  // Reset state when modal opens/closes
  useEffect(() => {
    if (open) {
      setSearchQuery('')
      setSelectedCustomer(currentCustomer)
      setActiveTab('search')
    }
  }, [open, currentCustomer])

  const handleCustomerSelect = (customer: Customer | null) => {
    setSelectedCustomer(customer)
    setCustomer(customer)
    onCustomerSelect?.(customer!)

    toast({
      title: customer ? "Cliente seleccionado" : "Cliente removido",
      description: customer ? `${customer.firstName} ${customer.lastName} seleccionado para esta venta` : "Venta sin cliente asignado",
    })
  }

  const handleClose = () => {
    onClose()
  }

  const filteredCustomers = customers.filter(customer =>
    `${customer.firstName} ${customer.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.phone?.includes(searchQuery)
  )

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <User className="h-5 w-5 mr-2" />
            Gestión de Clientes
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="search">Buscar Cliente</TabsTrigger>
            <TabsTrigger value="create">Nuevo Cliente</TabsTrigger>
            <TabsTrigger value="details" disabled={!selectedCustomer}>
              Detalles
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-auto">
            <TabsContent value="search" className="space-y-4 mt-4">
              <SearchCustomersTab
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                customers={filteredCustomers}
                selectedCustomer={selectedCustomer}
                onCustomerSelect={handleCustomerSelect}
                isOnline={isOnline}
              />
            </TabsContent>

            <TabsContent value="create" className="mt-4">
              <CreateCustomerTab
                onCustomerCreated={(customer: Customer) => {
                  refetchCustomers()
                  setSelectedCustomer(customer)
                  setActiveTab('details')
                }}
                isOnline={isOnline}
              />
            </TabsContent>

            <TabsContent value="details" className="mt-4">
              {selectedCustomer && (
                <CustomerDetailsTab
                  customer={selectedCustomer}
                  sales={customerSales}
                  onCustomerSelect={handleCustomerSelect}
                  isOnline={isOnline}
                />
              )}
            </TabsContent>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-4 border-t">
            <div className="flex items-center space-x-2">
              {selectedCustomer ? (
                <Badge variant="secondary" className="flex items-center">
                  <User className="h-3 w-3 mr-1" />
                  {selectedCustomer.firstName} {selectedCustomer.lastName}
                </Badge>
              ) : (
                <Badge variant="outline">Sin cliente</Badge>
              )}
            </div>

            <div className="flex space-x-2">
              {selectedCustomer && (
                <Button
                  variant="outline"
                  onClick={() => handleCustomerSelect(null)}
                >
                  <X className="h-4 w-4 mr-2" />
                  Remover Cliente
                </Button>
              )}
              <Button onClick={handleClose}>
                <Check className="h-4 w-4 mr-2" />
                Confirmar
              </Button>
            </div>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

interface SearchCustomersTabProps {
  searchQuery: string
  setSearchQuery: (query: string) => void
  customers: Customer[]
  selectedCustomer: Customer | null
  onCustomerSelect: (customer: Customer) => void
  isOnline: boolean
}

function SearchCustomersTab({
  searchQuery,
  setSearchQuery,
  customers,
  selectedCustomer,
  onCustomerSelect,
  isOnline
}: SearchCustomersTabProps) {
  if (!isOnline) {
    return (
      <div className="text-center py-8">
        <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">La búsqueda de clientes requiere conexión a internet</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Buscar por nombre, email o teléfono..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Current Selection */}
      {selectedCustomer && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-blue-900">{selectedCustomer.firstName}</p>
                  <p className="text-sm text-blue-600">{selectedCustomer.email || selectedCustomer.phone}</p>
                </div>
              </div>
              <Badge variant="default">Cliente Actual</Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Customer List */}
      <div className="space-y-2 max-h-96 overflow-auto">
        {customers.length === 0 ? (
          <div className="text-center py-8">
            <User className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">
              {searchQuery.length >= 2 ? 'No se encontraron clientes' : 'Escribe al menos 2 caracteres para buscar'}
            </p>
          </div>
        ) : (
          customers.map((customer: Customer) => (
            <CustomerCard
              key={customer.id}
              customer={customer}
              isSelected={selectedCustomer?.id === customer.id}
              onSelect={() => onCustomerSelect(customer)}
            />
          ))
        )}
      </div>
    </div>
  )
}

interface CreateCustomerTabProps {
  onCustomerCreated: (customer: Customer) => void
  isOnline: boolean
}

function CreateCustomerTab({ onCustomerCreated, isOnline }: CreateCustomerTabProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const createCustomer = useCreateCustomer()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "El nombre es requerido",
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)

    try {
      const [firstName, ...lastNameParts] = formData.name.trim().split(' ')
      const lastName = lastNameParts.join(' ')

      const customerData = {
        firstName,
        lastName: lastName || '',
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        address: formData.address || undefined
      }

      const customer = await createCustomer.mutateAsync(customerData)

      toast({
        title: "Cliente creado",
        description: `${customer.firstName} ${customer.lastName} ha sido creado exitosamente`,
      })

      onCustomerCreated(customer)

      // Reset form
      setFormData({ name: '', email: '', phone: '', address: '' })

    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo crear el cliente",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOnline) {
    return (
      <div className="text-center py-8">
        <Plus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Crear nuevos clientes requiere conexión a internet</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nombre *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Nombre completo"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Teléfono</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="+1234567890"
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="cliente@email.com"
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Dirección</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              placeholder="Dirección completa"
              className="pl-10"
            />
          </div>
        </div>
      </div>

      <Button
        type="submit"
        disabled={isSubmitting || !formData.name.trim()}
        className="w-full"
      >
        {isSubmitting ? (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="mr-2"
            >
              ⭐
            </motion.div>
            Creando Cliente...
          </>
        ) : (
          <>
            <Plus className="h-4 w-4 mr-2" />
            Crear Cliente
          </>
        )}
      </Button>
    </form>
  )
}

interface CustomerDetailsTabProps {
  customer: Customer
  sales?: Sale[]
  onCustomerSelect?: (customer: Customer) => void
  isOnline: boolean
}

function CustomerDetailsTab({ customer, sales = [], onCustomerSelect, isOnline }: CustomerDetailsTabProps) {
  const totalSales = sales.reduce((sum: number, sale: Sale) => sum + Number(sale.total), 0)
  const averageSale = sales.length > 0 ? totalSales / sales.length : 0

  return (
    <div className="space-y-6">
      {/* Customer Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">{customer.firstName} {customer.lastName}</h3>
                <p className="text-gray-600">Cliente desde {formatDate(new Date(customer.createdAt))}</p>
              </div>
            </div>
            <Button
              onClick={() => onCustomerSelect?.(customer)}
              variant="default"
            >
              <Check className="h-4 w-4 mr-2" />
              Seleccionar
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {customer.phone && (
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-gray-400" />
                <span className="text-sm">{customer.phone}</span>
              </div>
            )}
            {customer.email && (
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-gray-400" />
                <span className="text-sm">{customer.email}</span>
              </div>
            )}
            {customer.address && (
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span className="text-sm">{customer.address}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Sales Statistics */}
      {isOnline && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <ShoppingBag className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">{sales.length}</p>
              <p className="text-sm text-gray-600">Total Compras</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">{formatCurrency(totalSales)}</p>
              <p className="text-sm text-gray-600">Total Gastado</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Star className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">{formatCurrency(averageSale)}</p>
              <p className="text-sm text-gray-600">Promedio por Compra</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Sales */}
      {isOnline && sales.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Compras Recientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-auto">
              {sales.slice(0, 5).map((sale: Sale) => (
                <div key={sale.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                  <div>
                    <p className="font-medium">{formatCurrency(Number(sale.total))}</p>
                    <p className="text-sm text-gray-600">
                      {formatDate(new Date(sale.createdAt))} • {sale.paymentMethod}
                    </p>
                  </div>
                  <Badge variant="success">Completada</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

interface CustomerCardProps {
  customer: Customer
  isSelected: boolean
  onSelect: () => void
}

function CustomerCard({ customer, isSelected, onSelect }: CustomerCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card
        className={`cursor-pointer transition-all ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
          }`}
        onClick={onSelect}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isSelected ? 'bg-blue-100' : 'bg-gray-100'
                }`}>
                <User className={`h-5 w-5 ${isSelected ? 'text-blue-600' : 'text-gray-600'}`} />
              </div>
              <div>
                <p className="font-medium">{customer.firstName} {customer.lastName}</p>
                <p className="text-sm text-gray-600">
                  {customer.email || customer.phone || 'Sin contacto'}
                </p>
              </div>
            </div>
            {isSelected && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center"
              >
                <Check className="h-3 w-3 text-white" />
              </motion.div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}