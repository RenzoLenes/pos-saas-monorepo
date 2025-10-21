import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  ShoppingCart, 
  Store, 
  Users, 
  BarChart3, 
  Wifi, 
  Shield,
  Smartphone,
  CheckCircle
} from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <div className="container mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            POS SaaS
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Modern multi-tenant point of sale system for retail businesses. 
            Manage multiple outlets, work offline, and grow your business with our comprehensive POS solution.
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/sign-up">
              <Button size="lg" className="px-8">
                Get Started Free
              </Button>
            </Link>
            <Link href="/sign-in">
              <Button variant="outline" size="lg" className="px-8">
                Sign In
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Store className="h-6 w-6 mr-3 text-blue-600" />
                Multi-Outlet Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Manage multiple store locations from a single dashboard. 
                Each outlet can have its own inventory, staff, and settings.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Wifi className="h-6 w-6 mr-3 text-blue-600" />
                Offline Capability
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Continue selling even without internet connection. 
                All transactions sync automatically when connection is restored.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ShoppingCart className="h-6 w-6 mr-3 text-blue-600" />
                Advanced POS Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Multiple carts, barcode scanning, customer management, 
                discounts, and flexible payment options.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-6 w-6 mr-3 text-blue-600" />
                Customer Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Build customer relationships with detailed profiles, 
                purchase history, and loyalty programs.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-6 w-6 mr-3 text-blue-600" />
                Real-time Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Track sales performance, inventory levels, and business 
                insights with comprehensive reporting.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-6 w-6 mr-3 text-blue-600" />
                Secure & Scalable
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Enterprise-grade security with multi-tenant architecture 
                that scales with your business growth.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Key Benefits */}
        <div className="bg-white rounded-lg p-8 shadow-lg mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Why Choose POS SaaS?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-start">
                <CheckCircle className="h-6 w-6 text-green-600 mt-1 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-2">Multi-Tenant Architecture</h3>
                  <p className="text-gray-600">
                    Each business gets its own isolated environment with custom subdomain 
                    (e.g., yourstore.possaas.com)
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <CheckCircle className="h-6 w-6 text-green-600 mt-1 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-2">Offline-First Design</h3>
                  <p className="text-gray-600">
                    Keep selling even when internet is down. All data syncs automatically 
                    when connection returns.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <CheckCircle className="h-6 w-6 text-green-600 mt-1 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-2">Mobile Optimized</h3>
                  <p className="text-gray-600">
                    Works perfectly on tablets and mobile devices for maximum flexibility 
                    in any retail environment.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start">
                <CheckCircle className="h-6 w-6 text-green-600 mt-1 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-2">Barcode Scanning</h3>
                  <p className="text-gray-600">
                    Built-in camera barcode scanning with manual entry fallback. 
                    Generate and print barcodes for your products.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <CheckCircle className="h-6 w-6 text-green-600 mt-1 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-2">Inventory Management</h3>
                  <p className="text-gray-600">
                    Track stock levels across multiple outlets, set low stock alerts, 
                    and manage transfers between locations.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <CheckCircle className="h-6 w-6 text-green-600 mt-1 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-2">Flexible Payments</h3>
                  <p className="text-gray-600">
                    Accept cash, card, and mixed payments. Automatic change calculation 
                    and receipt generation.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Business?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Start your free trial today and see how POS SaaS can streamline your retail operations.
          </p>
          <Link href="/sign-up">
            <Button size="lg" className="px-12 py-4 text-lg">
              Start Free Trial
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}