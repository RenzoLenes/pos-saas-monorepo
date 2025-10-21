'use client'

import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAddToCart, cartKeys } from '@/hooks/api/use-cart'
import { useCreateProduct } from '@/hooks/api/use-products'
import { useOfflineCart } from '@/hooks/use-offline-sync'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { formatCurrency } from '@/lib/utils'
import { Search, Plus, ShoppingCart } from 'lucide-react'
import type { ProductDTO } from 'shared-types'

interface ProductGridProps {
  products: ProductDTO[]
  activeCartId: string
  outletId: string
  isOnline: boolean
}

export function ProductGrid({
  products,
  activeCartId,
  outletId,
  isOnline
}: ProductGridProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [showCustomProduct, setShowCustomProduct] = useState(false)
  const [customProduct, setCustomProduct] = useState({ name: '', price: '' })
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const addCartItem = useAddToCart()
  const createCustomProduct = useCreateProduct()

  const { addOfflineCartItem } = useOfflineCart(outletId)

  const filteredProducts = products.filter(product =>
    (product as any).isActive &&
    (product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
     product.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
     product.barcode?.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const handleAddToCart = async (product: ProductDTO) => {
    console.log('handleAddToCart called:', {
      productId: product.id,
      productName: product.name,
      activeCartId,
      isOnline
    })

    if (!activeCartId) {
      toast({
        title: "No active cart",
        description: "Please create a cart first",
        variant: "destructive",
      })
      return
    }

    try {
      if (isOnline) {
        console.log('Adding item to cart online...')
        await addCartItem.mutateAsync({
          cartId: activeCartId,
          data: {
            productId: product.id,
            quantity: 1,
          }
        })
        console.log('Item added successfully')
        toast({
          title: "Added to cart",
          description: "Product added successfully",
        })
      } else {
        // Add to offline cart
        console.log('Adding item to cart offline...')
        await addOfflineCartItem(activeCartId, {
          productId: product.id,
          quantity: 1,
          unitPrice: Number(product.price),
          totalPrice: Number(product.price),
        })
      }
    } catch (error) {
      console.error('Failed to add to cart:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add to cart",
        variant: "destructive",
      })
    }
  }

  const handleCreateCustomProduct = async () => {
    if (!customProduct.name || !customProduct.price) return

    try {
      const product = await createCustomProduct.mutateAsync({
        name: customProduct.name,
        price: parseFloat(customProduct.price),
        isCustom: true,
      })

      // Add to cart immediately
      await handleAddToCart(product as ProductDTO)

      // Reset form
      setCustomProduct({ name: '', price: '' })
      setShowCustomProduct(false)
    } catch (error) {
      console.error('Failed to create custom product:', error)
    }
  }

  return (
    <div className="space-y-4">
      {/* Search and Actions */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search products by name, SKU, or barcode..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Button
          variant="outline"
          onClick={() => setShowCustomProduct(!showCustomProduct)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Custom Item
        </Button>
      </div>

      {/* Custom Product Form */}
      {showCustomProduct && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <Input
                placeholder="Product name"
                value={customProduct.name}
                onChange={(e) => setCustomProduct(prev => ({ ...prev, name: e.target.value }))}
              />
              <Input
                placeholder="Price"
                type="number"
                step="0.01"
                value={customProduct.price}
                onChange={(e) => setCustomProduct(prev => ({ ...prev, price: e.target.value }))}
              />
              <Button
                onClick={handleCreateCustomProduct}
                disabled={!customProduct.name || !customProduct.price || createCustomProduct.isPending}
              >
                Add to Cart
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowCustomProduct(false)}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Product Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {filteredProducts.map((product) => (
          <Card
            key={product.id}
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => handleAddToCart(product)}
          >
            <CardContent className="p-4">
              <div className="space-y-2">
                <h3 className="font-medium text-sm line-clamp-2">
                  {product.name}
                </h3>

                {product.sku && (
                  <p className="text-xs text-gray-500">SKU: {product.sku}</p>
                )}

                <div className="flex items-center justify-between">
                  <span className="font-bold text-lg">
                    {formatCurrency(Number(product.price))}
                  </span>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleAddToCart(product)
                    }}
                    disabled={!activeCartId || addCartItem.isPending}
                  >
                    <ShoppingCart className="h-3 w-3" />
                  </Button>
                </div>

                {product.isCustom && (
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    Custom
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500">
            {searchQuery ? 'No products found matching your search.' : 'No products available.'}
          </div>
        </div>
      )}
    </div>
  )
}