'use client'

import { useEffect, useState } from 'react'
import { LuLock } from 'react-icons/lu'
import VerticalLayout from '@/layouts/VerticalLayout'
import { useSubscriptionGuard } from '@/hooks/useSubscriptionGuard'

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { blocked } = useSubscriptionGuard()
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    if (!blocked) return
    setCountdown(5)
    const timer = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) { clearInterval(timer); return 0 }
        return c - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [blocked])

  return (
    <>
      <VerticalLayout>{children}</VerticalLayout>

      {blocked && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          background: 'rgba(0, 0, 0, 0.45)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 12,
            padding: '2rem 2.5rem',
            maxWidth: 400,
            width: '90%',
            textAlign: 'center',
            boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
          }}>
            <div style={{
              width: 52,
              height: 52,
              background: '#fee2e2',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
            }}>
              <LuLock size={24} color="#A32D2D" />
            </div>
            <h3 style={{ margin: '0 0 0.5rem', color: '#1a2340', fontSize: '1.1rem', fontWeight: 700 }}>
              Account access changed
            </h3>
            <p style={{ margin: '0 0 1.25rem', fontSize: '0.875rem', color: '#6b7a99', lineHeight: 1.6 }}>
              Your account status has changed. You will be redirected automatically.
            </p>
            <div style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              background: '#f0f5ff',
              border: '2px solid #3b6fd4',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto',
              fontSize: '1.25rem',
              fontWeight: 700,
              color: '#3b6fd4',
            }}>
              {countdown}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Layout
