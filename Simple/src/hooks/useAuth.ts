import { useState } from 'react'
import { useRouter } from 'next/navigation'
import authService from '@/services/authService'

export const useAuth = () => {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const login = async (usernameOrEmail: string, password: string): Promise<void> => {
    setLoading(true)
    setError(null)
    try {
      const res = await authService.login(usernameOrEmail, password)

      if (!res.success) {
        setError(res.message)
        return
      }

      if (res.mustChangePassword) {
        router.push('/auth/change-password')
        return
      }

      router.push('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong')
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