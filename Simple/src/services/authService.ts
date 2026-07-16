import httpClient from './api'
import type { LoginResponse } from '@/types/auth'
import type {
  RegisterCompanyRequest,
  RegisterCompanyResponse,
} from '@/types/company'

// ── Auth Service ───────────────────────────────────────────────
interface AuthService {
  login:           (usernameOrEmail: string, password: string) => Promise<LoginResponse>
  logout:          () => Promise<void>
  getUser:         () => LoginResponse['user'] | null
  isAuthenticated: () => boolean
  registerCompany: (data: RegisterCompanyRequest) => Promise<RegisterCompanyResponse>
}

const authService: AuthService = {

  // ── Login ────────────────────────────────────────────────────
  login: async (usernameOrEmail, password) => {
    const res  = await httpClient.post<LoginResponse>('/api/auth/login', {
      usernameOrEmail,
      password,
    })
    const data = res.data

    if (data.success) {
      // Tokens are now in HttpOnly cookies set by the server.
      // Only store non-sensitive user info for client-side use.
      localStorage.setItem('user', JSON.stringify(data.user))
    }

    return data
  },

  // ── Logout ───────────────────────────────────────────────────
  logout: async () => {
    try {
      // Ask server to clear the HttpOnly cookies
      await httpClient.post('/api/auth/logout')
    } catch {
      // Proceed even if the request fails
    }

    localStorage.removeItem('user')
    document.cookie = 'graceAcknowledged=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
  },

  // ── Get stored user ──────────────────────────────────────────
  getUser: () => {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  },

  // ── Check if logged in ───────────────────────────────────────
  isAuthenticated: () => {
    return !!localStorage.getItem('user')
  },

  // ── Register Company + Admin User ────────────────────────────
  registerCompany: async (data: RegisterCompanyRequest) => {
    const res = await httpClient.post<RegisterCompanyResponse>(
      '/api/companies/register',
      data
    )
    return res.data
  },
}

export default authService