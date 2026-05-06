import httpClient from './api'
import type { LoginResponse } from '@/types/auth'

interface AuthService {
  login: (usernameOrEmail: string, password: string) => Promise<LoginResponse>
  logout: () => void
  getUser: () => LoginResponse['user'] | null
  isAuthenticated: () => boolean
}

const authService: AuthService = {
  login: async (usernameOrEmail, password) => {
    const res = await httpClient.post<LoginResponse>('/auth/login', { 
      usernameOrEmail, 
      password 
    })
    const data = res.data

    if (data.success) {
      localStorage.setItem('accessToken', data.accessToken)
      localStorage.setItem('refreshToken', data.refreshToken)
      localStorage.setItem('user', JSON.stringify(data.user))
    }

    return data
  },

  logout: () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
  },

  getUser: () => {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('accessToken')
  }
}

export default authService