'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import subscriptionService from '@/services/subscriptionService'

const LOCK_ROUTES: Record<string, string> = {
  trial_expired: '/subscription/trial-expired',
  suspended:     '/subscription/suspended',
  cancelled:     '/subscription/cancelled',
  grace:         '/subscription/grace',
}

export function useSubscriptionGuard() {
  const router = useRouter()
  const [blocked, setBlocked] = useState(false)

  useEffect(() => {
    const check = async () => {
      try {
        const sub = await subscriptionService.getStatus()
        const lockPath = LOCK_ROUTES[sub.status]

        if (lockPath) {
          setBlocked(true)
          setTimeout(() => router.push(lockPath), 5000)
        }
      } catch {
        // Ignore — don't kick out on API error
      }
    }

    check()
    const interval = setInterval(check, 60_000)
    return () => clearInterval(interval)
  }, [router])

  return { blocked }
}
