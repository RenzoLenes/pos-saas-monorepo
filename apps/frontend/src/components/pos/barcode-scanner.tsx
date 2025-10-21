'use client'

import { useState, useEffect, useRef } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { usePOSStore } from '@/store/pos-store'
import { useProductByBarcode } from '@/hooks/api/use-products'
import { useAddItemToCart } from '@/hooks/api/use-cart'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Camera, Keyboard, Loader2 } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

export function BarcodeScanner() {
  const { showBarcode, setShowBarcode } = usePOSStore()
  const activeCart = usePOSStore((state) => state.getActiveCart())

  const [scanMode, setScanMode] = useState<'camera' | 'manual'>('camera')
  const [scannedCode, setScannedCode] = useState('')
  const [manualCode, setManualCode] = useState('')
  const [isScanning, setIsScanning] = useState(false)

  const scannerRef = useRef<Html5Qrcode | null>(null)
  const readerIdRef = useRef('barcode-reader')

  const { data: product, isLoading: isLoadingProduct } = useProductByBarcode(
    scannedCode
  )
  const { mutate: addItem, isPending: isAddingItem } = useAddItemToCart()

  // Initialize scanner when modal opens in camera mode
  useEffect(() => {
    if (!showBarcode || scanMode !== 'camera') return

    const initScanner = async () => {
      try {
        setIsScanning(true)
        const scanner = new Html5Qrcode(readerIdRef.current)
        scannerRef.current = scanner

        await scanner.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          (decodedText) => {
            setScannedCode(decodedText)
            stopScanner()
          },
          (errorMessage) => {
            // Ignore errors during scanning
            console.debug('Scanner error:', errorMessage)
          }
        )
      } catch (error: any) {
        console.error('Error starting scanner:', error)
        toast({
          title: 'Error',
          description:
            'No se pudo acceder a la cámara. Usa el modo manual.',
          variant: 'destructive',
        })
        setScanMode('manual')
      } finally {
        setIsScanning(false)
      }
    }

    initScanner()

    return () => {
      stopScanner()
    }
  }, [showBarcode, scanMode])

  // Stop scanner
  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop()
        scannerRef.current.clear()
        scannerRef.current = null
      } catch (error) {
        console.error('Error stopping scanner:', error)
      }
    }
  }

  // Add product to cart when found
  useEffect(() => {
    if (product && activeCart && scannedCode) {
      addItem(
        {
          cartId: activeCart.id,
          data: {
            productId: product.id,
            quantity: 1,
            price: product.price,
          },
        },
        {
          onSuccess: () => {
            toast({
              title: 'Producto agregado',
              description: `${product.name} agregado al carrito`,
            })
            handleClose()
          },
          onError: (error: any) => {
            toast({
              title: 'Error',
              description: error.message || 'No se pudo agregar el producto',
              variant: 'destructive',
            })
          },
        }
      )
    }
  }, [product, activeCart, scannedCode, addItem])

  const handleClose = () => {
    stopScanner()
    setShowBarcode(false)
    setScannedCode('')
    setManualCode('')
    setScanMode('camera')
  }

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (manualCode.trim()) {
      setScannedCode(manualCode.trim())
    }
  }

  const switchToCamera = () => {
    setManualCode('')
    setScanMode('camera')
  }

  const switchToManual = () => {
    stopScanner()
    setScanMode('manual')
  }

  return (
    <Dialog open={showBarcode} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Escanear Código de Barras</DialogTitle>
          <DialogDescription>
            {scanMode === 'camera'
              ? 'Apunta la cámara hacia el código de barras'
              : 'Ingresa el código manualmente'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Mode Toggle */}
          <div className="flex gap-2">
            <Button
              variant={scanMode === 'camera' ? 'default' : 'outline'}
              size="sm"
              onClick={switchToCamera}
              className="flex-1"
            >
              <Camera className="h-4 w-4 mr-2" />
              Cámara
            </Button>
            <Button
              variant={scanMode === 'manual' ? 'default' : 'outline'}
              size="sm"
              onClick={switchToManual}
              className="flex-1"
            >
              <Keyboard className="h-4 w-4 mr-2" />
              Manual
            </Button>
          </div>

          {/* Camera Scanner */}
          {scanMode === 'camera' && (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              {isScanning && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
              )}
              <div id={readerIdRef.current}></div>
            </div>
          )}

          {/* Manual Input */}
          {scanMode === 'manual' && (
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="manual-code">Código de Barras</Label>
                <Input
                  id="manual-code"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  placeholder="Ingresa el código..."
                  autoFocus
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={!manualCode.trim() || isLoadingProduct || isAddingItem}
              >
                {isLoadingProduct || isAddingItem ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Buscando...
                  </>
                ) : (
                  'Buscar Producto'
                )}
              </Button>
            </form>
          )}

          {/* Loading State */}
          {isLoadingProduct && (
            <div className="text-center text-sm text-gray-500">
              Buscando producto...
            </div>
          )}

          {/* Not Found */}
          {scannedCode && !product && !isLoadingProduct && (
            <div className="p-3 bg-yellow-50 text-yellow-800 rounded-md text-sm">
              No se encontró un producto con el código: {scannedCode}
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
