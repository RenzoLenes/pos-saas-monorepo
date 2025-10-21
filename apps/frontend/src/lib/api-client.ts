import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'

// Global function to get token (will be set from the provider)
let getTokenFunction: (() => Promise<string | null>) | null = null

export const setTokenGetter = (fn: () => Promise<string | null>) => {
  getTokenFunction = fn
}

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
})

// Request interceptor - Automatically add token to all requests
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    if (getTokenFunction) {
      const token = await getTokenFunction()
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

// Response interceptor - Handle errors and retry with new token
apiClient.interceptors.response.use(
  (response) => response.data, // Return only data
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean
    }

    // If token expired (401) and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        // Get new token (Clerk will refresh if needed)
        if (getTokenFunction) {
          const newToken = await getTokenFunction()

          if (newToken) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`
            return apiClient(originalRequest)
          }
        }
      } catch (refreshError) {
        // If refresh fails, redirect to login
        if (typeof window !== 'undefined') {
          window.location.href = '/sign-in'
        }
        return Promise.reject(refreshError)
      }
    }

    // Transform error to consistent format
    const apiError = {
      code: (error.response?.data as any)?.error?.code || 'UNKNOWN_ERROR',
      message:
        (error.response?.data as any)?.error?.message || 'An error occurred',
      details: (error.response?.data as any)?.error?.details,
      status: error.response?.status,
    }

    return Promise.reject(apiError)
  }
)

export default apiClient
