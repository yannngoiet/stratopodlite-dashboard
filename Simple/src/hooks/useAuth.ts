import { useState } from 'react'
import { useRouter } from 'next/navigation'
import authService from '@/services/authService'

const STATIC_USERNAME = 'admin'
const STATIC_PASSWORD = 'admin123'

export const useAuth = () => {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const login = async (usernameOrEmail: string, password: string): Promise<void> => {
    setLoading(true)
    setError(null)

    await new Promise((r) => setTimeout(r, 500))

    if (usernameOrEmail !== STATIC_USERNAME || password !== STATIC_PASSWORD) {
      setError('Invalid username or password.')
      setLoading(false)
      return
    }

    localStorage.setItem('accessToken', 'static-token')
    localStorage.setItem('user', JSON.stringify({
      id: 1,
      companyId: 5,
      username: 'admin',
      email: 'admin@stratopod.co.za',
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      plantId: null
    }))

    router.push('/dashboard')
    setLoading(false)
  }

  const logout = () => {
    authService.logout()
    router.push('/auth/sign-in')
  }

  return { login, logout, error, loading }
}

export default useAuth
