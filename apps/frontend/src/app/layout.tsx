import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import { Toaster } from '@/components/ui/toaster'
import { ErrorBoundary } from '@/components/error-boundary'
import { Providers } from '@/providers/providers'
import { AuthProvider } from '@/lib/auth-context'
import { ApiClientProvider } from '@/lib/api-client-provider'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'POS SaaS - Multi-Tenant Point of Sale',
  description: 'Modern multi-tenant POS system for retail businesses',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'POS SaaS',
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'application-name': 'POS SaaS',
    'apple-mobile-web-app-title': 'POS SaaS',
    'msapplication-navbutton-color': '#3b82f6',
    'msapplication-TileColor': '#3b82f6',
    'msapplication-starturl': '/',
  },
}

export const viewport: Viewport = {
  themeColor: '#3b82f6',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <AuthProvider>
            <ApiClientProvider>
              <ErrorBoundary>
                <Providers>
                  {children}
                  <Toaster />
                </Providers>
              </ErrorBoundary>
            </ApiClientProvider>
          </AuthProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}