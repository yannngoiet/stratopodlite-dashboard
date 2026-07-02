'use client';
import { useEffect, useState } from 'react';
import { LuTruck, LuCheck, LuArrowRight, LuLoader } from 'react-icons/lu';
import { useRouter } from 'next/navigation';
import authService from '@/services/authService';
import planService, { PlanResponse } from '@/services/planService';
import paymentsService from '@/services/paymentsService';
import { notify } from '@/lib/toast';

export default function ChangePlanPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<PlanResponse[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<PlanResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingPlans, setLoadingPlans] = useState(true);

  useEffect(() => {
    planService.getAll()
      .then(data => setPlans(data.filter(p => p.monthlyPrice > 0)))
      .catch(() => notify.error('Error', 'Could not load plans.'))
      .finally(() => setLoadingPlans(false));
  }, []);

  const handlePay = async () => {
    if (!selectedPlan) return;
    setLoading(true);
    try {
      const user = authService.getUser();
      if (!user) {
        router.push('/auth/sign-in');
        return;
      }

      const { uuid } = await paymentsService.createOnsiteUuid({
        companyId: user.companyId,
        planId: selectedPlan.id,
        amount: selectedPlan.monthlyPrice,
        itemName: selectedPlan.name,
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
          notify.success('Payment successful!', 'Activating your account...');
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
          notify.error('Payment cancelled', 'Your payment was not completed.');
        }
      });
    } catch (err: any) {
      const message = err?.response?.data?.detail ?? err?.message ?? 'Something went wrong.';
      notify.error('Payment failed', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page" style={{ justifyContent: 'flex-start', paddingTop: '2rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
        <div className="auth-logo-circle">
          <LuTruck size={34} color="#fff" />
        </div>
        <p className="auth-logo-text">STRATO<span className="auth-logo-accent">POD</span></p>
        <p className="auth-logo-sub">Electronic Proof of Delivery</p>
      </div>

      <div className="auth-card" style={{ maxWidth: 520, width: '100%' }}>
        <div className="auth-card-heading">
          <h2 className="auth-card-title">Choose a Plan</h2>
          <p className="auth-card-sub">Select the plan that fits your business needs.</p>
        </div>

        {loadingPlans ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7a99' }}>
            <LuLoader size={24} style={{ animation: 'spin 1s linear infinite' }} />
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
            {plans.map(plan => (
              <div
                key={plan.id}
                onClick={() => setSelectedPlan(plan)}
                style={{
                  border: selectedPlan?.id === plan.id ? '2px solid #3b6fd4' : '1.5px solid #dde3f0',
                  borderRadius: 8,
                  padding: '1rem',
                  cursor: 'pointer',
                  background: selectedPlan?.id === plan.id ? '#f0f4ff' : '#fff',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: '0.95rem', color: '#1a2340' }}>{plan.name}</p>
                  <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#6b7a99' }}>
                    {plan.maxDrivers ? `Up to ${plan.maxDrivers} drivers` : 'Unlimited drivers'}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <p style={{ margin: 0, fontWeight: 700, color: '#3b6fd4', fontSize: '1rem' }}>
                    R{plan.monthlyPrice}/mo
                  </p>
                  {selectedPlan?.id === plan.id && (
                    <LuCheck size={18} color="#3b6fd4" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={handlePay}
          disabled={!selectedPlan || loading}
          style={{ width: '100%', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}
        >
          {loading ? (
            <><LuLoader size={14} style={{ animation: 'spin 1s linear infinite' }} /> Processing...</>
          ) : (
            <>Pay with PayFast <LuArrowRight size={14} /></>
          )}
        </button>

        <button
          onClick={() => router.back()}
          className="btn-ghost"
          style={{ width: '100%', justifyContent: 'center', fontSize: '0.8rem', color: '#6b7a99', padding: '0.5rem' }}
        >
          Go back
        </button>
      </div>

      <p className="auth-footer">&copy; {new Date().getFullYear()} StratoPOD. All rights reserved.</p>
    </div>
  );
}
