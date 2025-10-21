"use client"

import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { toast } from '@/hooks/use-toast'
import { useOutlets } from '@/hooks/api/use-outlets'
import { useUsers } from '@/hooks/api/use-users'

// Define UserRole type locally instead of importing from Prisma
type UserRole = 'admin' | 'manager' | 'cashier'

import {
  Settings,
  Store,
  Globe,
  DollarSign,
  Printer,
  Wifi,
  Users,
  Shield,
  Bell,
  Palette,
  Database,
  Download,
  Upload,
  Save,
  Plus,
  Edit3,
  Trash2
} from 'lucide-react'

type FormUser = {
  firstName: string
  lastName: string
  email: string
  role: UserRole
  outletId?: string
}

interface SettingsState {
  general: {
    companyName: string
    currency: string
    locale: string
    timezone: string
    dateFormat: string
  }
  pos: {
    autoSync: boolean
    syncInterval: number
    offlineMode: boolean
    printReceipts: boolean
    printBarcodes: boolean
    showProductImages: boolean
    soundEffects: boolean
  }
  receipts: {
    showLogo: boolean
    showTaxNumber: boolean
    footerText: string
    printCustomerInfo: boolean
  }
  security: {
    requirePin: boolean
    sessionTimeout: number
    twoFactorAuth: boolean
    loginAttempts: number
  }
  notifications: {
    lowStockAlerts: boolean
    dailySummary: boolean
    syncErrors: boolean
    emailNotifications: boolean
  }
}

export function SettingsForm() {
  // Fetch real data from React Query hooks
  const { data: outlets = [], isLoading: outletsLoading, error: outletsError } = useOutlets()
  const { data: usersData = [], isLoading: usersLoading, error: usersError } = useUsers()
  // Log errors for debugging
  if (outletsError) {
    console.error('Outlets error:', outletsError.message)
  }
  if (usersError) {
    console.error('Users error:', usersError.message)
  }

  const [settings, setSettings] = useState<SettingsState>({
    general: {
      companyName: 'POS SaaS',
      currency: 'USD',
      locale: 'es-ES',
      timezone: 'America/Mexico_City',
      dateFormat: 'DD/MM/YYYY'
    },
    pos: {
      autoSync: true,
      syncInterval: 5,
      offlineMode: true,
      printReceipts: true,
      printBarcodes: false,
      showProductImages: true,
      soundEffects: false
    },
    receipts: {
      showLogo: true,
      showTaxNumber: true,
      footerText: 'Gracias por su compra',
      printCustomerInfo: true
    },
    security: {
      requirePin: false,
      sessionTimeout: 30,
      twoFactorAuth: false,
      loginAttempts: 3
    },
    notifications: {
      lowStockAlerts: true,
      dailySummary: true,
      syncErrors: true,
      emailNotifications: false
    }
  })

  const [showUserModal, setShowUserModal] = useState(false)
  const [newUser, setNewUser] = useState<FormUser>({
    firstName: '',
    lastName: '',
    email: '',
    role: 'cashier',
    outletId: ''
  });


  const updateSetting = (section: keyof SettingsState, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }))
  }

  const handleSave = () => {
    toast({
      title: "Configuración guardada",
      description: "Los cambios han sido aplicados exitosamente",
      variant: "default"
    })
  }

  const handleAddUser = () => {
    if (!newUser.firstName || !newUser.lastName || !newUser.email || !newUser.outletId) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos requeridos",
        variant: "destructive"
      })
      return
    }

    // TODO: Implement user creation when backend endpoint is available
    toast({
      title: "Funcionalidad no disponible",
      description: "La creación de usuarios será implementada próximamente. Los usuarios se gestionan desde Clerk.",
      variant: "default"
    })

    setNewUser({ firstName: '', lastName: '', email: '', role: 'cashier', outletId: '' })
    setShowUserModal(false)
  }

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold">Configuración del Sistema</h1>
          <p className="text-gray-600">Personaliza y configura tu sistema POS</p>
        </div>
        <Button onClick={handleSave} className="flex items-center">
          <Save className="h-4 w-4 mr-2" />
          Guardar Cambios
        </Button>
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-6"
      >
        {/* General Settings */}
        <motion.div variants={item}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Configuración General
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="companyName">Nombre de la Empresa</Label>
                  <Input
                    id="companyName"
                    value={settings.general.companyName}
                    onChange={(e) => updateSetting('general', 'companyName', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="currency">Moneda</Label>
                  <Select 
                    value={settings.general.currency}
                    onValueChange={(value) => updateSetting('general', 'currency', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD - Dólar Estadounidense</SelectItem>
                      <SelectItem value="EUR">EUR - Euro</SelectItem>
                      <SelectItem value="MXN">MXN - Peso Mexicano</SelectItem>
                      <SelectItem value="COP">COP - Peso Colombiano</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="locale">Idioma/Región</Label>
                  <Select 
                    value={settings.general.locale}
                    onValueChange={(value) => updateSetting('general', 'locale', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="es-ES">Español (España)</SelectItem>
                      <SelectItem value="es-MX">Español (México)</SelectItem>
                      <SelectItem value="en-US">English (US)</SelectItem>
                      <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="timezone">Zona Horaria</Label>
                  <Select 
                    value={settings.general.timezone}
                    onValueChange={(value) => updateSetting('general', 'timezone', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/Mexico_City">México (UTC-6)</SelectItem>
                      <SelectItem value="America/New_York">Nueva York (UTC-5)</SelectItem>
                      <SelectItem value="Europe/Madrid">Madrid (UTC+1)</SelectItem>
                      <SelectItem value="America/Bogota">Bogotá (UTC-5)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* POS Settings */}
        <motion.div variants={item}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Store className="h-5 w-5 mr-2" />
                Configuración POS
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Sincronización Automática</Label>
                        <p className="text-sm text-gray-600">Sincronizar datos automáticamente</p>
                      </div>
                      <Switch
                        checked={settings.pos.autoSync}
                        onCheckedChange={(checked) => updateSetting('pos', 'autoSync', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Modo Offline</Label>
                        <p className="text-sm text-gray-600">Permitir ventas sin conexión</p>
                      </div>
                      <Switch
                        checked={settings.pos.offlineMode}
                        onCheckedChange={(checked) => updateSetting('pos', 'offlineMode', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Imprimir Recibos</Label>
                        <p className="text-sm text-gray-600">Imprimir automáticamente</p>
                      </div>
                      <Switch
                        checked={settings.pos.printReceipts}
                        onCheckedChange={(checked) => updateSetting('pos', 'printReceipts', checked)}
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Códigos de Barras</Label>
                        <p className="text-sm text-gray-600">Incluir nombre en código</p>
                      </div>
                      <Switch
                        checked={settings.pos.printBarcodes}
                        onCheckedChange={(checked) => updateSetting('pos', 'printBarcodes', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Imágenes de Productos</Label>
                        <p className="text-sm text-gray-600">Mostrar imágenes en POS</p>
                      </div>
                      <Switch
                        checked={settings.pos.showProductImages}
                        onCheckedChange={(checked) => updateSetting('pos', 'showProductImages', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Efectos de Sonido</Label>
                        <p className="text-sm text-gray-600">Sonidos al escanear</p>
                      </div>
                      <Switch
                        checked={settings.pos.soundEffects}
                        onCheckedChange={(checked) => updateSetting('pos', 'soundEffects', checked)}
                      />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="syncInterval">Intervalo de Sincronización (minutos)</Label>
                    <Input
                      id="syncInterval"
                      type="number"
                      value={settings.pos.syncInterval}
                      onChange={(e) => updateSetting('pos', 'syncInterval', parseInt(e.target.value))}
                      min="1"
                      max="60"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Receipt Settings */}
        <motion.div variants={item}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Printer className="h-5 w-5 mr-2" />
                Configuración de Recibos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Mostrar Logo</Label>
                        <p className="text-sm text-gray-600">Logo de empresa en recibo</p>
                      </div>
                      <Switch
                        checked={settings.receipts.showLogo}
                        onCheckedChange={(checked) => updateSetting('receipts', 'showLogo', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Número de RFC/Tax</Label>
                        <p className="text-sm text-gray-600">Mostrar información fiscal</p>
                      </div>
                      <Switch
                        checked={settings.receipts.showTaxNumber}
                        onCheckedChange={(checked) => updateSetting('receipts', 'showTaxNumber', checked)}
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Info del Cliente</Label>
                        <p className="text-sm text-gray-600">Incluir datos del cliente</p>
                      </div>
                      <Switch
                        checked={settings.receipts.printCustomerInfo}
                        onCheckedChange={(checked) => updateSetting('receipts', 'printCustomerInfo', checked)}
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <Label htmlFor="footerText">Texto del Pie de Página</Label>
                  <Textarea
                    id="footerText"
                    value={settings.receipts.footerText}
                    onChange={(e) => updateSetting('receipts', 'footerText', e.target.value)}
                    placeholder="Mensaje en el pie del recibo..."
                    rows={3}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* User Management */}
        <motion.div variants={item}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Gestión de Usuarios
                </div>
                <Dialog open={showUserModal} onOpenChange={setShowUserModal}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar Usuario
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Agregar Nuevo Usuario</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Nombre</Label>
                          <Input
                            value={newUser.firstName}
                            onChange={(e) => setNewUser({...newUser, firstName: e.target.value})}
                            placeholder="Nombre"
                          />
                        </div>
                        <div>
                          <Label>Apellido</Label>
                          <Input
                            value={newUser.lastName}
                            onChange={(e) => setNewUser({...newUser, lastName: e.target.value})}
                            placeholder="Apellido"
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Email</Label>
                        <Input
                          type="email"
                          value={newUser.email}
                          onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                          placeholder="email@ejemplo.com"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Rol</Label>
                          <Select
                            value={newUser.role}
                            onValueChange={(value) => setNewUser({...newUser, role: value as UserRole})}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">Administrador</SelectItem>
                              <SelectItem value="manager">Gerente</SelectItem>
                              <SelectItem value="cashier">Cajero</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Outlet</Label>
                          <Select
                            value={newUser.outletId || ''}
                            onValueChange={(value) => setNewUser({...newUser, outletId: value})}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar outlet" />
                            </SelectTrigger>
                            <SelectContent>
                              {outlets.map((outlet: any) => (
                                <SelectItem key={outlet.id} value={outlet.id}>
                                  {outlet.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="flex justify-end space-x-2 pt-4">
                        <Button variant="outline" onClick={() => setShowUserModal(false)}>
                          Cancelar
                        </Button>
                        <Button onClick={handleAddUser}>
                          Agregar Usuario
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Outlet</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usersLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        Cargando usuarios...
                      </TableCell>
                    </TableRow>
                  ) : usersData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        No hay usuarios registrados
                      </TableCell>
                    </TableRow>
                  ) : (
                    usersData.map((user: any) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          {user.firstName} {user.lastName}
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant={
                            user.role === 'admin' ? 'default' :
                            user.role === 'manager' ? 'secondary' : 'outline'
                          }>
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>{user.outlet?.name || 'N/A'}</TableCell>
                        <TableCell>
                          <Badge variant="success">
                            Activo
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <Edit3 className="h-3 w-3" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </motion.div>

        {/* System Actions */}
        <motion.div variants={item}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="h-5 w-5 mr-2" />
                Acciones del Sistema
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg text-center">
                  <Download className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <h3 className="font-medium mb-2">Exportar Datos</h3>
                  <p className="text-sm text-gray-600 mb-3">Descargar backup completo</p>
                  <Button variant="outline" size="sm" className="w-full">
                    Exportar
                  </Button>
                </div>
                <div className="p-4 border rounded-lg text-center">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <h3 className="font-medium mb-2">Importar Datos</h3>
                  <p className="text-sm text-gray-600 mb-3">Restaurar desde backup</p>
                  <Button variant="outline" size="sm" className="w-full">
                    Importar
                  </Button>
                </div>
                <div className="p-4 border rounded-lg text-center">
                  <Wifi className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                  <h3 className="font-medium mb-2">Forzar Sync</h3>
                  <p className="text-sm text-gray-600 mb-3">Sincronizar todos los datos</p>
                  <Button variant="outline" size="sm" className="w-full">
                    Sincronizar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  )
}