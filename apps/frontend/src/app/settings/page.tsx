"use client"

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { SettingsForm } from '@/components/settings/settings-form'

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <div className="p-6">
        <SettingsForm />
      </div>
    </DashboardLayout>
  )
}