"use client"

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { CustomerList } from '@/components/customers/customer-list'

export default function CustomersPage() {
  return (
    <DashboardLayout>
      <div className="p-6">
        <CustomerList />
      </div>
    </DashboardLayout>
  )
}