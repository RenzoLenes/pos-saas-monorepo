'use client'

import { useUser } from '@clerk/nextjs'
import { useCurrentTenant } from '@/hooks/api/use-tenants'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { SalesMetrics } from '@/components/dashboard/sales-metrics'
import { formatCurrency, formatDate } from '@/lib/utils'
import { 
  ShoppingCart, 
  Settings,
  Plus
} from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const { user } = useUser()

  // Get tenant info
  const { data: tenant } = useCurrentTenant()

  if (!user || !tenant) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-gray-600">Bienvenido de vuelta, {user.firstName}!</p>
            <p className="text-sm text-gray-500 mt-1">{tenant.name}</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <Link href="/pos">
              <Button>
                <ShoppingCart className="h-4 w-4 mr-2" />
                Abrir POS
              </Button>
            </Link>
            
            <Link href="/inventory">
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Inventario
              </Button>
            </Link>
            
            <Link href="/settings">
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Configuración
              </Button>
            </Link>
          </div>
        </div>

        {/* Sales Metrics */}
        <SalesMetrics />
      </div>
    </DashboardLayout>
  )
}