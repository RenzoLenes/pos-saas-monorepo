import apiClient from '@/lib/api-client'
import type { UserDTO } from 'shared-types'

export const usersService = {
  /**
   * Get all users
   */
  getAll: async (): Promise<UserDTO[]> => {
    const response = await apiClient.get('/users')
    return response.data || []
  },

  /**
   * Get user by ID
   */
  getById: async (id: string): Promise<UserDTO> => {
    const response = await apiClient.get(`/users/${id}`)
    return response.data || []
  },

  /**
   * Get current authenticated user
   */
  getCurrent: async (): Promise<UserDTO> => {
    const response = await apiClient.get('/users/me')
    return response.data || []
  },

  /**
   * Update user
   */
  update: async (id: string, data: any): Promise<UserDTO> => {
    const response = await apiClient.put(`/users/${id}`, data)
    return response.data || []
  },

  /**
   * Delete user
   */
  delete: async (id: string): Promise<void> => {
    const response = await apiClient.delete(`/users/${id}`)
    return response.data || []
  },
}
