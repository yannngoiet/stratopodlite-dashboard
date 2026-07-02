'use client';
import { useState } from 'react';
import { LuTruck, LuLock, LuArrowRight, LuLoader, LuRefreshCw } from 'react-icons/lu';
import { useRouter } from 'next/navigation';
import authService from '@/services/authService';
import httpClient from '@/services/api';
import paymentsService from '@/services/paymentsService';
import { notify } from '@/lib/toast';

export default function CancelledPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSignOut = () => {
    localStorage.clear();
    document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    router.push('/auth/sign-in');
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
          notify.success('Payment successful!', 'Reactivating your account...');
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
      notify.error('Reactivation failed', message);
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
        <div style={{ background: '#FCEBEB', border: '1.5px solid #F5AAAA', padding: '0.875rem 1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <LuLock size={18} color="#A32D2D" style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <p style={{ margin: '0 0 3px', fontWeight: 700, color: '#A32D2D', fontSize: '0.875rem' }}>Account cancelled</p>
            <p style={{ margin: 0, fontSize: '0.82rem', color: '#A32D2D', lineHeight: 1.5 }}>
              Your subscription has been cancelled. All your data is safe.
            </p>
          </div>
        </div>

        <div className="auth-card-heading">
          <h2 className="auth-card-title">Reactivate your account</h2>
          <p className="auth-card-sub">Complete your payment on PayFast to reactivate immediately.</p>
        </div>

        <div style={{ background: '#f8f9fc', border: '1px solid #dde3f0', padding: '0.75rem 1rem', marginBottom: '1.25rem', fontSize: '0.78rem', color: '#6b7a99', lineHeight: 1.8 }}>
          ✓ Your data is safe — nothing has been deleted<br />
          ✓ Reactivation is instant once payment is processed<br />
          ✓ All drivers and dispatchers restored immediately
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
              Reactivate on PayFast <LuArrowRight size={14} />
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

        <button onClick={handleSignOut} className="btn-ghost" style={{ width: '100%', justifyContent: 'center', fontSize: '0.8rem', color: '#6b7a99', padding: '0.5rem' }}>
          Sign in with a different account
        </button>

        <p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#6b7a99', marginTop: '1rem', marginBottom: 0 }}>
          Need help? <a href="mailto:support@stratopod.co.za" style={{ color: '#3b6fd4' }}>support@stratopod.co.za</a>
        </p>
      </div>

      <p className="auth-footer">&copy; {new Date().getFullYear()} StratoPOD. All rights reserved.</p>
    </div>
  );
}
