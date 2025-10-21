'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { useCheckSubdomain, useCreateTenant } from '@/hooks/api/use-tenants'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function OnboardingPage() {
  const router = useRouter()
  const { user } = useUser()
  const [tenantName, setTenantName] = useState('')
  const [subdomain, setSubdomain] = useState('')
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null)

  const { data: subdomainCheck, isLoading: isCheckingSubdomain } = useCheckSubdomain(
    { subdomain },
    {
      enabled: subdomain.length > 0,
      onSuccess: (data: { available: boolean }) => {
        setIsAvailable(data.available)
      },
      onError: () => {
        setIsAvailable(null)
      },
    }
  )

  const createTenant = useCreateTenant({
    onSuccess: () => {
      router.push('/dashboard')
    },
  })

  const handleSubdomainChange = (value: string) => {
    const cleanValue = value.toLowerCase().replace(/[^a-z0-9-]/g, '')
    setSubdomain(cleanValue)
    if (!cleanValue) {
      setIsAvailable(null)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user || !tenantName || !subdomain || !isAvailable) return

    createTenant.mutate({
      name: tenantName,
      subdomain,
      ownerClerkId: user.id,
      ownerEmail: user.emailAddresses[0]?.emailAddress || '',
      ownerFirstName: user.firstName || '',
      ownerLastName: user.lastName || '',
    })
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Setup Your Business</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tenantName">Business Name</Label>
              <Input
                id="tenantName"
                value={tenantName}
                onChange={(e) => setTenantName(e.target.value)}
                placeholder="My Store"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subdomain">Subdomain</Label>
              <div className="flex">
                <Input
                  id="subdomain"
                  value={subdomain}
                  onChange={(e) => handleSubdomainChange(e.target.value)}
                  placeholder="mystore"
                  required
                  className={`rounded-r-none ${
                    isAvailable === false ? 'border-red-500' : 
                    isAvailable === true ? 'border-green-500' : ''
                  }`}
                />
                <div className="bg-gray-100 px-3 py-2 border border-l-0 rounded-r text-sm text-gray-600">
                  .pos.com
                </div>
              </div>
              {isCheckingSubdomain && (
                <p className="text-sm text-gray-500">Checking availability...</p>
              )}
              {isAvailable === false && (
                <p className="text-sm text-red-500">Subdomain not available</p>
              )}
              {isAvailable === true && (
                <p className="text-sm text-green-500">Subdomain available!</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={!tenantName || !subdomain || isAvailable !== true || createTenant.isPending}
            >
              {createTenant.isPending ? 'Creating...' : 'Create Business'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}