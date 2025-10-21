'use client'

import { useEffect, ReactNode } from 'react'
import { setTokenGetter } from './api-client'
import { useAuthToken } from './auth-context'

export function ApiClientProvider({ children }: { children: ReactNode }) {
  const { getToken } = useAuthToken()

  useEffect(() => {
    // Configure the global token function for the interceptor
    setTokenGetter(getToken)
  }, [getToken])

  return <>{children}</>
}
