'use client'

import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { usePOSStore, usePOSActions } from '@/store/pos-store'
import { useOutlets } from '@/hooks/api/use-outlets'
import { Store, MapPin } from 'lucide-react'
import type { OutletDTO } from 'shared-types'

interface OutletSelectorProps {
  outlets?: OutletDTO[]
  selectedOutletId?: string
  onOutletChange?: (outletId: string) => void
  variant?: 'default' | 'compact'
}

export function OutletSelector({
  outlets: propOutlets,
  selectedOutletId: propSelectedOutletId,
  onOutletChange: propOnOutletChange,
  variant = 'default'
}: OutletSelectorProps) {
  const { selectedOutletId: storeSelectedOutletId } = usePOSStore()
  const { selectOutlet } = usePOSActions()

  // Use props if provided, otherwise fetch outlets
  const { data: fetchedOutlets = [] } = useOutlets()

  const outlets = propOutlets || fetchedOutlets
  const selectedOutletId = propSelectedOutletId || storeSelectedOutletId
  const onOutletChange = propOnOutletChange || selectOutlet
  
  const selectedOutlet = outlets.find(outlet => outlet.id === selectedOutletId)

  if (outlets.length === 0) {
    return (
      <div className="flex items-center text-gray-500">
        <Store className="h-4 w-4 mr-2" />
        <span className="text-sm">No hay outlets disponibles</span>
      </div>
    )
  }

  if (outlets.length === 1) {
    const outlet = outlets[0]
    return (
      <div className="flex items-center space-x-2">
        <Store className="h-4 w-4 text-blue-600" />
        <div className="flex flex-col">
          <span className="font-medium text-sm">{outlet.name}</span>
          {variant === 'default' && outlet.address && (
            <span className="text-xs text-gray-500 flex items-center">
              <MapPin className="h-3 w-3 mr-1" />
              {outlet.address}
            </span>
          )}
        </div>
        <Badge variant="secondary" className="ml-auto">
          {outlet.currency}
        </Badge>
      </div>
    )
  }

  return (
    <div className="flex items-center space-x-2">
      <Store className="h-4 w-4 text-blue-600" />
      <Select value={selectedOutletId} onValueChange={onOutletChange}>
        <SelectTrigger className={variant === 'compact' ? "w-40" : "w-56"}>
          <SelectValue placeholder="Seleccionar outlet">
            {selectedOutlet && (
              <div className="flex items-center justify-between w-full">
                <span className="truncate">{selectedOutlet.name}</span>
                <Badge variant="secondary" className="ml-2 text-xs">
                  {selectedOutlet.currency}
                </Badge>
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {outlets.map((outlet) => (
            <SelectItem key={outlet.id} value={outlet.id}>
              <div className="flex items-center justify-between w-full">
                <div className="flex flex-col items-start">
                  <span className="font-medium">{outlet.name}</span>
                  {outlet.address && (
                    <span className="text-xs text-gray-500 flex items-center mt-1">
                      <MapPin className="h-3 w-3 mr-1" />
                      {outlet.address}
                    </span>
                  )}
                </div>
                <div className="flex flex-col items-end ml-4">
                  <Badge variant="secondary" className="text-xs">
                    {outlet.currency}
                  </Badge>
                  {outlet.status === 'active' ? (
                    <span className="text-xs text-green-600 mt-1">Activo</span>
                  ) : (
                    <span className="text-xs text-red-600 mt-1">Inactivo</span>
                  )}
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}