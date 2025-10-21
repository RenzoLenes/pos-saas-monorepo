'use client'

import { useState, useMemo } from 'react'
import { useCustomers, useCreateCustomer } from '@/hooks/api/use-customers'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Search, Plus, User, X } from 'lucide-react'
import type { CustomerDTO } from 'shared-types'

interface CustomerSelectorProps {
  onSelect: (customer: CustomerDTO | null) => void
  onClose: () => void
}

export function CustomerSelector({ onSelect, onClose }: CustomerSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newCustomer, setNewCustomer] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
  })

  const { data: allCustomers = [] } = useCustomers()

  const createCustomer = useCreateCustomer()

  // Filter customers on the client side
  const searchResults = useMemo(() => {
    if (searchQuery.length < 2) return []

    const query = searchQuery.toLowerCase()
    return allCustomers.filter(customer =>
      customer.firstName?.toLowerCase().includes(query) ||
      customer.lastName?.toLowerCase().includes(query) ||
      customer.email?.toLowerCase().includes(query) ||
      customer.phone?.toLowerCase().includes(query)
    ).slice(0, 10)
  }, [searchQuery, allCustomers])

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newCustomer.firstName || !newCustomer.lastName) {
      return
    }

    const customer = await createCustomer.mutateAsync({
      firstName: newCustomer.firstName,
      lastName: newCustomer.lastName,
      email: newCustomer.email || undefined,
      phone: newCustomer.phone || undefined,
      address: newCustomer.address || undefined,
    })

    onSelect(customer)
    onClose()
  }

  const resetNewCustomer = () => {
    setNewCustomer({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
    })
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Select Customer
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="search" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="search">Search</TabsTrigger>
            <TabsTrigger value="create">Create New</TabsTrigger>
          </TabsList>
          
          <TabsContent value="search" className="space-y-4">
            {/* Walk-in Customer Option */}
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => {
                onSelect(null) // No customer selected = walk-in
                onClose()
              }}
            >
              <User className="h-4 w-4 mr-2" />
              Walk-in Customer
            </Button>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search customers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Search Results */}
            <div className="space-y-2 max-h-60 overflow-auto">
              {searchResults.map((customer) => (
                <Card 
                  key={customer.id}
                  className="cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => {
                    onSelect(customer)
                    onClose()
                  }}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">
                          {customer.firstName} {customer.lastName}
                        </p>
                        {customer.email && (
                          <p className="text-xs text-gray-500">{customer.email}</p>
                        )}
                        {customer.phone && (
                          <p className="text-xs text-gray-500">{customer.phone}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {searchQuery.length >= 2 && searchResults.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  No customers found
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="create" className="space-y-4">
            <form onSubmit={handleCreateCustomer} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={newCustomer.firstName}
                    onChange={(e) => setNewCustomer(prev => ({ 
                      ...prev, 
                      firstName: e.target.value 
                    }))}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={newCustomer.lastName}
                    onChange={(e) => setNewCustomer(prev => ({ 
                      ...prev, 
                      lastName: e.target.value 
                    }))}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newCustomer.email}
                  onChange={(e) => setNewCustomer(prev => ({ 
                    ...prev, 
                    email: e.target.value 
                  }))}
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={newCustomer.phone}
                  onChange={(e) => setNewCustomer(prev => ({ 
                    ...prev, 
                    phone: e.target.value 
                  }))}
                />
              </div>

              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={newCustomer.address}
                  onChange={(e) => setNewCustomer(prev => ({ 
                    ...prev, 
                    address: e.target.value 
                  }))}
                />
              </div>

              <div className="flex space-x-2">
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={!newCustomer.firstName || !newCustomer.lastName || createCustomer.isPending}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create & Select
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetNewCustomer}
                >
                  Clear
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}