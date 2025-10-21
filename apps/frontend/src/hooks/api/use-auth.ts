import { useQuery } from '@tanstack/react-query'
import { authService } from '@/services/auth.service'

// Query keys para organizar el cache
export const authKeys = {
  all: ['auth'] as const,
  currentUser: () => [...authKeys.all, 'currentUser'] as const,
}

/**
 * Get current authenticated user from backend
 * This queries the backend for the user info (different from Clerk's user)
 */
export const useAuthUser = () => {
  return useQuery({
    queryKey: authKeys.currentUser(),
    queryFn: authService.getCurrentUser,
  })
}
