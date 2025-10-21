"use client"

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { usePOSStore, usePOSSelectors } from '@/store/pos-store'
import { OfflineIndicator } from '@/components/pos/offline-indicator'
import { OutletSelector } from '@/components/pos/outlet-selector'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  BarChart3,
  Settings,
  Menu,
  X,
  Store,
  Receipt,
  Wifi,
  WifiOff
} from 'lucide-react'
import { useAuth, UserButton } from '@clerk/nextjs'

interface DashboardLayoutProps {
  children: React.ReactNode
  showOutletSelector?: boolean
}

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'POS',
    href: '/pos',
    icon: ShoppingCart,
  },
  {
    name: 'Inventario',
    href: '/inventory',
    icon: Package,
  },
  {
    name: 'Clientes',
    href: '/customers',
    icon: Users,
  },
  {
    name: 'Ventas',
    href: '/sales',
    icon: Receipt,
  },
  {
    name: 'Reportes',
    href: '/reports',
    icon: BarChart3,
  },
  {
    name: 'Configuración',
    href: '/settings',
    icon: Settings,
  },
]

export function DashboardLayout({ children, showOutletSelector = true }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const { pendingOperations } = usePOSSelectors.useSyncStatus()

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      {/* Mobile sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 flex z-40 md:hidden"
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-gray-600 bg-opacity-75"
                onClick={() => setSidebarOpen(false)}
              />

              <motion.div
                initial={{ x: -300 }}
                animate={{ x: 0 }}
                exit={{ x: -300 }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                className="relative flex-1 flex flex-col max-w-xs w-full pt-5 pb-4 bg-white"
              >
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: 0.1 }}
                  className="absolute top-0 right-0 -mr-12 pt-2"
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSidebarOpen(false)}
                    className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                  >
                    <X className="h-6 w-6 text-white" />
                  </Button>
                </motion.div>
                <div className="flex-shrink-0 flex items-center px-4">
                  <Store className="h-8 w-8 text-blue-600" />
                  <span className="ml-2 text-xl font-bold text-gray-900">POS SaaS</span>
                </div>
                <div className="mt-5 flex-1 h-0 overflow-y-auto">
                  <Navigation pathname={pathname} />
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Static sidebar for desktop */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex flex-col flex-grow pt-5 bg-white overflow-y-auto border-r border-gray-200">
          <div className="flex items-center flex-shrink-0 px-4">
            <Store className="h-8 w-8 text-blue-600" />
            <span className="ml-2 text-xl font-bold text-gray-900">POS SaaS</span>
          </div>
          <div className="mt-5 flex-grow flex flex-col">
            <Navigation pathname={pathname} />
          </div>

          <div className="flex items-center justify-center py-4 border-t border-gray-200">
            <UserButton
              showName
              appearance={{
                elements: {
                  userButtonBox: "flex flex-row-reverse items-center gap-2"
                }
              }}
            />

          </div>

          {/* Connection status at bottom */}
          <div className="flex-shrink-0 p-4 border-t border-gray-200">
            <OfflineIndicator />
            {pendingOperations > 0 && (
              <div className="mt-2 text-xs text-orange-600 flex items-center">
                <div className="animate-pulse h-2 w-2 bg-orange-500 rounded-full mr-2"></div>
                {pendingOperations} operaciones pendientes
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden md:ml-64">
        {/* Top navigation */}
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(true)}
            className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 md:hidden"
          >
            <Menu className="h-6 w-6" />
          </Button>

          <div className="flex-1 px-4 flex justify-between items-center">
            <div className="flex-1 flex">
              <PageTitle pathname={pathname} />
            </div>

            <div className="ml-4 flex items-center md:ml-6 space-x-4">
              {/* Online/Offline status for mobile */}
              <div className="md:hidden">
                <OfflineIndicator />
              </div>

              {showOutletSelector && (
                <OutletSelector />
              )}
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          {children}
        </main>
      </div>
    </div>
  )
}

function Navigation({ pathname }: { pathname: string }) {
  return (
    <nav className="mt-5 flex-1 px-2 space-y-1">
      {navigation.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors relative overflow-hidden',
              isActive
                ? 'bg-blue-100 text-blue-900 border-r-4 border-blue-600'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            )}
          >
            {isActive && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-blue-50"
                initial={false}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
            <item.icon
              className={cn(
                'mr-3 flex-shrink-0 h-5 w-5 relative z-10',
                isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'
              )}
            />
            <span className="relative z-10">{item.name}</span>

            {/* Badge for POS when there are pending operations */}
            {item.href === '/pos' && (
              <PendingOperationsBadge />
            )}
          </Link>
        )
      })}
    </nav>
  )
}

function PageTitle({ pathname }: { pathname: string }) {
  const currentPage = navigation.find(item => pathname === item.href || pathname.startsWith(item.href + '/'))

  return (
    <div className="flex items-center">
      <h1 className="text-2xl font-semibold text-gray-900">
        {currentPage?.name || 'POS SaaS'}
      </h1>
    </div>
  )
}

function PendingOperationsBadge() {
  const { pendingOperations } = usePOSSelectors.useSyncStatus()

  if (pendingOperations === 0) return null

  return (
    <Badge variant="warning" className="ml-auto relative z-10">
      {pendingOperations}
    </Badge>
  )
}