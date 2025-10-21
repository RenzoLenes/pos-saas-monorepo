"use client"

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { ReportsDashboard } from '@/components/reports/reports-dashboard'

export default function ReportsPage() {
  return (
    <DashboardLayout>
      <div className="p-6">
        <ReportsDashboard />
      </div>
    </DashboardLayout>
  )
}