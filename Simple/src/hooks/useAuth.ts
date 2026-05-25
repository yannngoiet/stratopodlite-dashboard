import { useState } from 'react'
import { useRouter } from 'next/navigation'
import authService from '@/services/authService'

export const useAuth = () => {
  const router = useRouter()
  const [error,   setError]   = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const login = async (usernameOrEmail: string, password: string): Promise<void> => {
    setLoading(true)
    setError(null)

    try {
      const data = await authService.login(usernameOrEmail, password)

      if (!data.success) {
        setError(data.message || 'Invalid username or password.')
        setLoading(false)
        return
      }

      // TODO: re-enable force password change later
      // if (data.mustChangePassword) {
      //   router.push('/auth/change-password')
      //   return
      // }

      router.push('/dashboard')

    } catch {
      setError('Invalid username or password.')
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    authService.logout()
    router.push('/auth/sign-in')
  }

  return { login, logout, error, loading }
}

export default useAuth