"use client"

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { InventoryTable } from '@/components/inventory/inventory-table'

export default function InventoryPage() {
  return (
    <DashboardLayout>
      <div className="p-6">
        <InventoryTable />
      </div>
    </DashboardLayout>
  )
}