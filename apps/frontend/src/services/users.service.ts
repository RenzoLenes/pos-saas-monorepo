import apiClient from '@/lib/api-client'
import type { UserDTO } from 'shared-types'

export const usersService = {
  /**
   * Get all users
   */
  getAll: async (): Promise<UserDTO[]> => {
    return await apiClient.get('/users')
  },

  /**
   * Get user by ID
   */
  getById: async (id: string): Promise<UserDTO> => {
    return await apiClient.get(`/users/${id}`)
  },

  /**
   * Get current authenticated user
   */
  getCurrent: async (): Promise<UserDTO> => {
    return await apiClient.get('/users/me')
  },

  /**
   * Update user
   */
  update: async (id: string, data: any): Promise<UserDTO> => {
    return await apiClient.put(`/users/${id}`, data)
  },

  /**
   * Delete user
   */
  delete: async (id: string): Promise<void> => {
    return await apiClient.delete(`/users/${id}`)
  },
}
