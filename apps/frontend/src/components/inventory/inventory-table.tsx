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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { useOutlets } from '@/hooks/api/use-outlets'
import { useProducts } from '@/hooks/api/use-products'
import { formatCurrency } from '@/lib/utils'
import type { CategoryDTO, ProductWithInventoryDTO } from 'shared-types'
import { 
  Package, 
  Search, 
  Filter, 
  Plus, 
  Edit3, 
  AlertTriangle,
  Barcode,
  Eye,
  Settings
} from 'lucide-react'
import { useCategories } from '@/hooks/api/use-categories'

export function InventoryTable() {
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('')
  const [outletFilter, setOutletFilter] = useState<string>('')
  const [stockFilter, setStockFilter] = useState<string>('')
  const [selectedProduct, setSelectedProduct] = useState<ProductWithInventoryDTO | null>(null)
  const [showProductModal, setShowProductModal] = useState(false)

  // Fetch real data from APIs
  const { data: outlets = [] } = useOutlets()
  const firstOutletId = outlets[0]?.id

  const { data: productsData, isLoading: isLoadingProducts } = useProducts({
    outletId: firstOutletId
  })
  const products = (productsData || []) as ProductWithInventoryDTO[]

  // Note: Categories are included in ProductDTO, extract unique categories
  const {data:categoriesData, isLoading: isLoadingCategories} = useCategories()
  const categories = categoriesData || [] as CategoryDTO[]


  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.sku && product.sku.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (product.barcode && product.barcode.includes(searchQuery))
    
    const matchesCategory = !categoryFilter || categoryFilter === 'all' || product.categoryName === categoryFilter
    const matchesOutlet = !outletFilter || outletFilter === 'all' || 
      product.inventory?.some((inv: any) => inv.outletId === outletFilter)
    const matchesStock = !stockFilter || stockFilter === 'all' || 
      (stockFilter === 'low' && product.inventory?.some((inv: any) => inv.quantity <= inv.minStock)) ||
      (stockFilter === 'normal' && product.inventory?.some((inv: any) => inv.quantity > inv.minStock))
    
    return matchesSearch && matchesCategory && matchesOutlet && matchesStock
  })

  const lowStockCount = products.filter(p => 
    p.inventory?.some((inv: any) => inv.quantity <= inv.minStock)
  ).length

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
          <h1 className="text-3xl font-bold">Inventario</h1>
          <p className="text-gray-600">Gestiona productos y stock de tus outlets</p>
        </div>
        <Button className="flex items-center">
          <Plus className="h-4 w-4 mr-2" />
          Agregar Producto
        </Button>
      </motion.div>

      {/* Loading State */}
      {isLoadingProducts ? (
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
      ) : !firstOutletId ? (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay Outlets</h3>
          <p className="text-gray-600">Crea un outlet para ver el inventario</p>
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
                  <p className="text-sm font-medium text-gray-600">Total Productos</p>
                  <p className="text-2xl font-bold">{products.length}</p>
                </div>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Package className="h-6 w-6 text-blue-600" />
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
                  <p className="text-sm font-medium text-gray-600">Stock Bajo</p>
                  <p className="text-2xl font-bold text-red-600">{lowStockCount}</p>
                </div>
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
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
                  <p className="text-sm font-medium text-gray-600">Valor Total</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(products.reduce((sum, p) => {
                      const totalStock = p.inventory?.reduce((stockSum: number, inv: any) => stockSum + inv.quantity, 0) || 0
                      return sum + (Number(p.price) * totalStock)
                    }, 0))}
                  </p>
                </div>
                <div className="p-2 bg-green-100 rounded-lg">
                  <Package className="h-6 w-6 text-green-600" />
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
                  <p className="text-sm font-medium text-gray-600">Categorías</p>
                  <p className="text-2xl font-bold">{categories.length}</p>
                </div>
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Settings className="h-6 w-6 text-purple-600" />
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar productos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas las categorías" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.name}>{category.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

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

              <Select value={stockFilter} onValueChange={setStockFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Estado de stock" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="low">Stock Bajo</SelectItem>
                  <SelectItem value="normal">Stock Normal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Products Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Productos ({filteredProducts.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead>SKU/Código</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Outlet</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <motion.tr
                    key={product.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50"
                  >
                    <TableCell>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <div className="flex items-center text-xs text-gray-500 mt-1">
                          <Barcode className="h-3 w-3 mr-1" />
                          {product.barcode}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {product.sku}
                      </code>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{product.categoryName || 'Sin categoría'}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(Number(product.price))}
                    </TableCell>
                    <TableCell>
                      {product.inventory?.map((inv: any) => {
                        if (firstOutletId && inv.outletId !== firstOutletId) return null
                        return (
                          <div key={inv.id} className="flex items-center">
                            <span className={`font-medium ${
                              inv.quantity <= inv.minStock ? 'text-red-600' : 'text-gray-900'
                            }`}>
                              {inv.quantity}
                            </span>
                            {inv.quantity <= inv.minStock && (
                              <AlertTriangle className="h-4 w-4 text-red-500 ml-2" />
                            )}
                          </div>
                        )
                      })}
                      {product.inventory?.find((inv: any) => !firstOutletId || inv.outletId === firstOutletId) && (
                        <p className="text-xs text-gray-500">
                          Min: {product.inventory.find((inv: any) => !firstOutletId || inv.outletId === firstOutletId)?.minStock}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {outlets.find(o => o.id === firstOutletId)?.name || 'Todos'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={(product as any).isActive ? "success" : "secondary"}>
                        {(product as any).isActive ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedProduct(product)
                            setShowProductModal(true)
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

      {/* Product Detail Modal */}
      <Dialog open={showProductModal} onOpenChange={setShowProductModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalles del Producto</DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Nombre del Producto</Label>
                  <Input value={selectedProduct.name} readOnly />
                </div>
                <div>
                  <Label>SKU</Label>
                  <Input value={selectedProduct.sku || ''} readOnly />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Precio</Label>
                  <Input value={formatCurrency(selectedProduct.price)} readOnly />
                </div>
                <div>
                  <Label>Stock Actual</Label>
                  <Input
                    value={selectedProduct.inventory?.[0]?.quantity || 0}
                    className={
                      (selectedProduct.inventory?.[0]?.quantity || 0) <= (selectedProduct.inventory?.[0]?.minStock || 0)
                        ? 'border-red-300' : ''
                    }
                  />
                </div>
                <div>
                  <Label>Stock Mínimo</Label>
                  <Input value={selectedProduct.inventory?.[0]?.minStock || 0} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Categoría</Label>
                  <Select value={selectedProduct.categoryName || ''}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category.id} value={category.name}>{category.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Outlet</Label>
                  <Select value={firstOutletId || ''}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {outlets.map(outlet => (
                        <SelectItem key={outlet.id} value={outlet.id}>{outlet.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Código de Barras</Label>
                <div className="flex items-center space-x-2">
                  <Input value={selectedProduct.barcode || ''} readOnly className="flex-1" />
                  <Button variant="outline" size="sm">
                    <Barcode className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setShowProductModal(false)}>
                  Cancelar
                </Button>
                <Button>
                  Guardar Cambios
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