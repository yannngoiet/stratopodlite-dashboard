'use client';
import { useEffect, useState } from 'react';
import { LuTruck, LuTriangleAlert, LuArrowRight } from 'react-icons/lu';
import { useRouter } from 'next/navigation';
import subscriptionService from '@/services/subscriptionService';

export default function GracePeriodPage() {
  const router = useRouter();
  const [daysLeft, setDaysLeft] = useState<number | null>(null);

  useEffect(() => {
    subscriptionService.getStatus().then(s => setDaysLeft(s.daysLeft)).catch(() => {});
  }, []);

  const handleContinue = () => {
    // Set cookie so proxy knows user acknowledged the grace warning
    document.cookie = 'graceAcknowledged=true; path=/; SameSite=Strict'
    router.push('/dashboard')
  }

  return (
    <div className="auth-page">
      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
        <div className="auth-logo-circle">
          <LuTruck size={34} color="#fff" />
        </div>
        <p className="auth-logo-text">
          STRATO<span className="auth-logo-accent">POD</span>
        </p>
        <p className="auth-logo-sub">Electronic Proof of Delivery</p>
      </div>

      <div className="auth-card">
        {/* Amber alert */}
        <div style={{ background: '#FAEEDA', border: '1.5px solid #F5C078', padding: '0.875rem 1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <LuTriangleAlert size={18} color="#854F0B" style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <p style={{ margin: '0 0 3px', fontWeight: 700, color: '#854F0B', fontSize: '0.875rem' }}>Payment failed</p>
            <p style={{ margin: 0, fontSize: '0.82rem', color: '#854F0B', lineHeight: 1.5 }}>
              Your last payment could not be processed.
              {daysLeft !== null && <> You have <strong>{daysLeft} day{daysLeft !== 1 ? 's' : ''}</strong> to update your billing before your account is suspended.</>}
            </p>
          </div>
        </div>

        <div className="auth-card-heading">
          <h2 className="auth-card-title">Update your billing</h2>
          <p className="auth-card-sub">Update your payment details on PayFast to restore full access. Your data is safe during the grace period.</p>
        </div>

        <button
          onClick={() => window.open('https://www.payfast.co.za', '_blank')}
          style={{ width: '100%', justifyContent: 'center', marginBottom: 8 }}
        >
          Update billing on PayFast <LuArrowRight size={14} />
        </button>

        <button
          onClick={handleContinue}
          className="btn-outline"
          style={{ width: '100%', justifyContent: 'center' }}
        >
          Continue to dashboard
        </button>

        <p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#6b7a99', marginTop: '1rem', marginBottom: 0 }}>
          Need help? <a href="mailto:support@stratopod.co.za" style={{ color: '#3b6fd4' }}>support@stratopod.co.za</a>
        </p>
      </div>

      <p className="auth-footer">&copy; {new Date().getFullYear()} StratoPOD. All rights reserved.</p>
    </div>
  );
}