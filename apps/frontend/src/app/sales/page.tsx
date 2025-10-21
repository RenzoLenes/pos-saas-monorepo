"use client"

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { SalesTable } from '@/components/sales/sales-table'

export default function SalesPage() {
  return (
    <DashboardLayout>
      <div className="p-6">
        <SalesTable />
      </div>
    </DashboardLayout>
  )
}