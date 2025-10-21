'use client'

import { useState } from 'react'
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from '@/hooks/api/use-products'
import { useCategories } from '@/hooks/api/use-categories'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Plus, Search, Edit, Trash2, Package } from 'lucide-react'
import Link from 'next/link'
import type { ProductDTO } from 'shared-types'

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<ProductDTO | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    barcode: '',
    price: '',
    categoryId: '',
    description: '',
  })

  const { data: products, isLoading } = useProducts()
  const { data: categories } = useCategories()
  const { mutate: createProduct, isPending: isCreating } = useCreateProduct()
  const { mutate: updateProduct, isPending: isUpdating } = useUpdateProduct()
  const { mutate: deleteProduct } = useDeleteProduct()

  const filteredProducts = products?.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.barcode?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCreateProduct = () => {
    createProduct(
      {
        name: formData.name,
        sku: formData.sku || undefined,
        barcode: formData.barcode || undefined,
        price: parseFloat(formData.price),
        categoryId: formData.categoryId || undefined,
        description: formData.description || undefined,
        isActive: true,
      },
      {
        onSuccess: () => {
          setIsCreateModalOpen(false)
          resetForm()
        },
      }
    )
  }

  const handleUpdateProduct = () => {
    if (!selectedProduct) return

    updateProduct(
      {
        id: selectedProduct.id,
        data: {
          name: formData.name,
          sku: formData.sku || undefined,
          barcode: formData.barcode || undefined,
          price: parseFloat(formData.price),
          categoryId: formData.categoryId || undefined,
          description: formData.description || undefined,
        },
      },
      {
        onSuccess: () => {
          setIsEditModalOpen(false)
          setSelectedProduct(null)
          resetForm()
        },
      }
    )
  }

  const handleDeleteProduct = (id: string) => {
    if (confirm('¿Estás seguro de eliminar este producto?')) {
      deleteProduct(id)
    }
  }

  const openEditModal = (product: ProductDTO) => {
    setSelectedProduct(product)
    setFormData({
      name: product.name,
      sku: product.sku || '',
      barcode: product.barcode || '',
      price: product.price.toString(),
      categoryId: product.categoryId || '',
      description: product.description || '',
    })
    setIsEditModalOpen(true)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      sku: '',
      barcode: '',
      price: '',
      categoryId: '',
      description: '',
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Productos</h1>
            <p className="text-sm text-gray-500 mt-1">
              Gestiona tu catálogo de productos
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Link href="/dashboard">
              <Button variant="outline">Volver al Dashboard</Button>
            </Link>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Producto
            </Button>
          </div>
        </div>

        {/* Search and Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="md:col-span-3">
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por nombre, SKU o código de barras..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Productos
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{products?.length || 0}</div>
              <p className="text-xs text-muted-foreground">
                {filteredProducts?.length || 0} en resultados
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Products Table */}
        <Card>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Código de Barras</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead className="text-right">Precio</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <Package className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                      <p className="text-gray-500">
                        {searchTerm
                          ? 'No se encontraron productos'
                          : 'No hay productos. Crea uno para empezar.'}
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProducts?.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">
                        {product.name}
                      </TableCell>
                      <TableCell>{product.sku || '-'}</TableCell>
                      <TableCell>{product.barcode || '-'}</TableCell>
                      <TableCell>
                        {categories?.find((c) => c.id === product.categoryId)
                          ?.name || '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        ${product.price.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditModal(product)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteProduct(product.id)}
                          >
                            <Trash2 className="h-4 w-4" />
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

        {/* Create Product Modal */}
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Producto</DialogTitle>
              <DialogDescription>
                Completa la información del producto
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Nombre del producto"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sku">SKU</Label>
                <Input
                  id="sku"
                  value={formData.sku}
                  onChange={(e) =>
                    setFormData({ ...formData, sku: e.target.value })
                  }
                  placeholder="SKU-001"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="barcode">Código de Barras</Label>
                <Input
                  id="barcode"
                  value={formData.barcode}
                  onChange={(e) =>
                    setFormData({ ...formData, barcode: e.target.value })
                  }
                  placeholder="1234567890"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="categoryId">Categoría</Label>
                <select
                  id="categoryId"
                  value={formData.categoryId}
                  onChange={(e) =>
                    setFormData({ ...formData, categoryId: e.target.value })
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Seleccionar categoría</option>
                  {categories?.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="price">Precio *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="description">Descripción</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Descripción del producto"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreateModalOpen(false)
                  resetForm()
                }}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCreateProduct}
                disabled={!formData.name || !formData.price || isCreating}
              >
                {isCreating ? 'Creando...' : 'Crear Producto'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Product Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Editar Producto</DialogTitle>
              <DialogDescription>
                Actualiza la información del producto
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nombre *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-sku">SKU</Label>
                <Input
                  id="edit-sku"
                  value={formData.sku}
                  onChange={(e) =>
                    setFormData({ ...formData, sku: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-barcode">Código de Barras</Label>
                <Input
                  id="edit-barcode"
                  value={formData.barcode}
                  onChange={(e) =>
                    setFormData({ ...formData, barcode: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-categoryId">Categoría</Label>
                <select
                  id="edit-categoryId"
                  value={formData.categoryId}
                  onChange={(e) =>
                    setFormData({ ...formData, categoryId: e.target.value })
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Seleccionar categoría</option>
                  {categories?.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="edit-price">Precio *</Label>
                <Input
                  id="edit-price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="edit-description">Descripción</Label>
                <Input
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditModalOpen(false)
                  setSelectedProduct(null)
                  resetForm()
                }}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleUpdateProduct}
                disabled={!formData.name || !formData.price || isUpdating}
              >
                {isUpdating ? 'Actualizando...' : 'Actualizar Producto'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
