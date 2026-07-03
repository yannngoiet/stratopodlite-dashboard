'use client';
import { useEffect, useState } from 'react';
import { LuTruck, LuTriangleAlert, LuArrowRight, LuLoader, LuRefreshCw } from 'react-icons/lu';
import { useRouter } from 'next/navigation';
import authService from '@/services/authService';
import httpClient from '@/services/api';
import paymentsService from '@/services/paymentsService';
import subscriptionService from '@/services/subscriptionService';
import { notify } from '@/lib/toast';

export default function GracePeriodPage() {
  const router = useRouter();
  const [daysLeft, setDaysLeft] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    subscriptionService.getStatus().then(s => setDaysLeft(s.daysLeft)).catch(() => {});
  }, []);

  const handleContinue = () => {
    document.cookie = 'graceAcknowledged=true; path=/; SameSite=Lax';
    router.push('/dashboard');
  };

  const handleReactivate = async () => {
    setLoading(true);
    try {
      const user = authService.getUser();
      if (!user) {
        notify.error('Session expired', 'Please sign in again.');
        router.push('/auth/sign-in');
        return;
      }

      const statusRes = await httpClient.get<{
        planId: number;
        planName: string;
        planMonthlyPrice: number;
      }>('/api/subscription/status');

      const { planId, planName, planMonthlyPrice } = statusRes.data;

      if (!planId || !planMonthlyPrice) {
        notify.error('Plan not found', 'Could not load your subscription details. Please contact support.');
        return;
      }

      const { uuid } = await paymentsService.createOnsiteUuid({
        companyId: user.companyId,
        planId,
        amount: planMonthlyPrice,
        itemName: planName ?? 'StratoPOD Subscription',
        emailAddress: user.email,
      });

      if (!(window as any).payfast_do_onsite_payment) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://sandbox.payfast.co.za/onsite/engine.js';
          script.onload = () => resolve();
          script.onerror = () => reject(new Error('Failed to load PayFast'));
          document.head.appendChild(script);
        });
      }

      setLoading(false);

      (window as any).payfast_do_onsite_payment({ uuid }, (result: boolean) => {
        if (result) {
          notify.success('Payment successful!', 'Restoring your account...');
          setLoading(true);

          let attempts = 0;
          const checkStatus = async () => {
            attempts++;
            try {
              const res = await fetch('/api/subscription-status', { cache: 'no-store' });
              if (res.ok) {
                const data = await res.json();
                if (data.status === 'active') {
                  window.location.href = '/dashboard';
                  return;
                }
              }
            } catch {}
            if (attempts >= 15) {
              window.location.href = '/dashboard';
              return;
            }
            setTimeout(checkStatus, 2000);
          };
          checkStatus();
        } else {
          notify.error('Payment cancelled', 'Your payment was not completed. Please try again.');
        }
      });

    } catch (err: any) {
      const message = err?.response?.data?.detail ?? err?.response?.data?.message ?? err?.message ?? 'Something went wrong. Please try again.';
      notify.error('Payment failed', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
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
          <p className="auth-card-sub">Complete your payment on PayFast to restore full access. Your data is safe during the grace period.</p>
        </div>

        <button
          onClick={handleReactivate}
          disabled={loading}
          style={{ width: '100%', justifyContent: 'center', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}
        >
          {loading ? (
            <>
              <LuLoader size={14} style={{ animation: 'spin 1s linear infinite' }} />
              Loading payment...
            </>
          ) : (
            <>
              Pay now on PayFast <LuArrowRight size={14} />
            </>
          )}
        </button>

        <button
          onClick={() => router.push('/subscription/change-plan')}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            marginBottom: 8,
            background: '#fff',
            border: '1.5px solid #3b6fd4',
            color: '#3b6fd4',
            borderRadius: 4,
            padding: '0.6rem 1rem',
            fontWeight: 600,
            fontSize: '0.875rem',
            cursor: 'pointer',
          }}
        >
          <LuRefreshCw size={14} />
          Change or upgrade plan
        </button>

        <button
          onClick={handleContinue}
          className="btn-ghost"
          style={{ width: '100%', justifyContent: 'center', fontSize: '0.8rem', color: '#6b7a99', padding: '0.5rem' }}
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
