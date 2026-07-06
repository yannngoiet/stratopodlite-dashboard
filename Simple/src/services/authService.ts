import httpClient from './api'
import type { LoginResponse } from '@/types/auth'
import type {
  RegisterCompanyRequest,
  RegisterCompanyResponse,
} from '@/types/company'

// ── Auth Service ───────────────────────────────────────────────
interface AuthService {
  login:           (usernameOrEmail: string, password: string) => Promise<LoginResponse>
  logout:          () => void
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
      // Store in localStorage for client-side API calls
      localStorage.setItem('accessToken',  data.accessToken)
      localStorage.setItem('refreshToken', data.refreshToken)
      localStorage.setItem('user',         JSON.stringify(data.user))

      // SameSite=Lax allows cookie to be sent when redirected from
      // external sites (e.g. Xero redirecting back to dashboard)
      document.cookie = `accessToken=${data.accessToken}; path=/; SameSite=Lax`
    }

    return data
  },

  // ── Logout ───────────────────────────────────────────────────
  logout: () => {
    // Clear localStorage
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')

    // Clear auth cookie
    document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'

    // Clear grace period acknowledgement cookie
    document.cookie = 'graceAcknowledged=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
  },

  // ── Get stored user ──────────────────────────────────────────
  getUser: () => {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  },

  // ── Check if logged in ───────────────────────────────────────
  isAuthenticated: () => {
    return !!localStorage.getItem('accessToken')
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