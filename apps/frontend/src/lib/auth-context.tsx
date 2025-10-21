'use client'

import { createContext, useContext, ReactNode } from 'react'
import { useAuth } from '@clerk/nextjs'

interface AuthContextType {
  getToken: () => Promise<string | null>
  isAuthenticated: boolean
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const { getToken, isLoaded, isSignedIn } = useAuth()

  const getAuthToken = async (): Promise<string | null> => {
    try {
      // expirationBuffer: 10s by default
      // If token expires in <10s, it will be refreshed automatically
      const token = await getToken()
      return token
    } catch (error) {
      console.error('Error getting auth token:', error)
      return null
    }
  }

  return (
    <AuthContext.Provider
      value={{
        getToken: getAuthToken,
        isAuthenticated: isSignedIn ?? false,
        isLoading: !isLoaded,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthToken() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuthToken must be used within AuthProvider')
  }
  return context
}
