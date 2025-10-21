import apiClient from '@/lib/api-client'
import type { UserDTO } from 'shared-types'

export const authService = {
  /**
   * Get current authenticated user from backend
   */
  getCurrentUser: async (): Promise<UserDTO> => {
    return await apiClient.get('/auth/me')
  },

  /**
   * Sync user from Clerk webhook
   */
  syncUser: async (data: any): Promise<UserDTO> => {
    return await apiClient.post('/auth/sync', data)
  },

  /**
   * Invite new user to organization
   */
  inviteUser: async (data: { email: string; role: string }): Promise<void> => {
    return await apiClient.post('/auth/invite', data)
  },
}
