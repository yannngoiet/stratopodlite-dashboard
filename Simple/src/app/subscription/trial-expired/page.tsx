'use client';
import { useEffect, useState } from 'react';
import { LuTruck, LuClock, LuArrowRight, LuCheck, LuMinus, LuPlus } from 'react-icons/lu';
import { useRouter } from 'next/navigation';
import planService, { type PlanResponse } from '@/services/planService';
import paymentsService from '@/services/paymentsService';
import { notify } from '@/lib/toast';

export default function TrialExpiredPage() {
  const router                    = useRouter();
  const [plans, setPlans]         = useState<PlanResponse[]>([]);
  const [loading, setLoading]     = useState(true);
  const [selected, setSelected]   = useState<string | null>(null);
  const [driverCount, setDriverCount] = useState(5);
  const [paying, setPaying]       = useState(false);

  useEffect(() => {
    planService.getAll()
      .then(data => {
        setPlans(data)
        const def = data.find(p => p.monthlyPrice > 0)
        if (def) setSelected(def.code)
      })
      .catch(() => notify.error('Failed to load plans', 'Please refresh the page.'))
      .finally(() => setLoading(false))
  }, []);

  const selectedPlan = plans.find(p => p.code === selected)

  const handleChoosePlan = async () => {
    if (!selected || !selectedPlan) return
    setPaying(true)
    try {
      const user   = JSON.parse(localStorage.getItem('user') ?? '{}')
      const amount = selectedPlan.monthlyPrice * driverCount

      const { uuid } = await paymentsService.createOnsiteUuid({
        companyId:    user.companyId,
        planId:       selectedPlan.id,
        amount,
        itemName:     `StratoPOD ${selectedPlan.name} - ${driverCount} driver${driverCount !== 1 ? 's' : ''}`,
        emailAddress: user.email,
      })

      // Load PayFast onsite engine
      if (!(window as any).payfast_do_onsite_payment) {
        await new Promise<void>((resolve, reject) => {
          const script    = document.createElement('script')
          script.src      = 'https://sandbox.payfast.co.za/onsite/engine.js'
          script.onload   = () => resolve()
          script.onerror  = () => reject(new Error('Failed to load PayFast'))
          document.head.appendChild(script)
        })
      }

      setPaying(false);

      (window as any).payfast_do_onsite_payment({ uuid }, (result: boolean) => {
        if (result) {
          notify.success('Payment successful!', `Your ${selectedPlan.name} plan is now active.`);
          setPaying(true);

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
      })

    } catch (err: any) {
      notify.error('Payment failed', err?.message ?? 'Could not start payment. Please try again.')
      setPaying(false)
    }
  }

  const handleSignOut = () => {
    localStorage.clear();
    document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    router.push('/auth/sign-in');
  };

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

      <div className="auth-card" style={{ maxWidth: 520 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
          <div style={{ width: 52, height: 52, background: '#3b6fd4', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
            <LuClock size={24} color="#fff" />
          </div>
          <div className="auth-card-heading" style={{ textAlign: 'center' }}>
            <h2 className="auth-card-title">Your free trial has ended</h2>
            <p className="auth-card-sub">Choose a plan to keep using StratoPOD — all your data is safe.</p>
          </div>
        </div>

        {/* Plans */}
        <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6b7a99', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 0.75rem' }}>
          Choose a plan to continue
        </p>

        {loading ? (
          <p style={{ fontSize: '0.82rem', color: '#6b7a99', textAlign: 'center', padding: '1rem 0' }}>
            Loading plans...
          </p>
        ) : (
          plans.map(p => {
            const isPremium  = p.monthlyPrice === 0
            const isSelected = selected === p.code
            return (
              <div
                key={p.id}
                onClick={() => !isPremium && setSelected(p.code)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '0.75rem',
                  border: `1.5px solid ${isSelected ? '#3b6fd4' : '#dde3f0'}`,
                  marginBottom: 8,
                  cursor: isPremium ? 'default' : 'pointer',
                  background: isSelected ? '#f0f5ff' : '#fff',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                  <div style={{
                    width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                    background: isSelected ? '#3b6fd4' : '#dde3f0',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <LuCheck size={10} color="#fff" />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.82rem', fontWeight: 600, color: isPremium ? '#29b6c5' : '#1a2340' }}>
                      {p.name}
                    </span>
                    {p.maxDrivers && (
                      <span style={{ fontSize: '0.72rem', color: '#6b7a99', marginLeft: 6 }}>
                        Up to {p.maxDrivers} drivers
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  {isPremium ? (
                    <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#29b6c5' }}>Contact us</span>
                  ) : (
                    <>
                      <span style={{ fontSize: '1rem', fontWeight: 800, color: '#1a2340' }}>R{p.monthlyPrice}</span>
                      <span style={{ fontSize: '0.7rem', color: '#6b7a99' }}>/driver/mo</span>
                    </>
                  )}
                </div>
              </div>
            )
          })
        )}

        {/* Driver count + total */}
        {selectedPlan && selectedPlan.monthlyPrice > 0 && (
          <div style={{ background: '#f0f5ff', border: '1.5px solid #dde3f0', padding: '0.875rem 1rem', marginTop: 8, marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: '0.82rem', color: '#1a2340', fontWeight: 600 }}>How many drivers?</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <button
                  className="btn-stepper"
                  onClick={() => setDriverCount(d => Math.max(1, d - 1))}
                  style={{ width: 28, height: 28, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6 }}
                >
                  <LuMinus size={12} />
                </button>
                <span style={{ minWidth: 36, textAlign: 'center', fontSize: '1rem', fontWeight: 700, color: '#3b6fd4', background: '#fff', border: '1.5px solid #dde3f0', borderRadius: 6, padding: '2px 8px' }}>
                  {driverCount}
                </span>
                <button
                  className="btn-stepper"
                  onClick={() => setDriverCount(d => Math.min(selectedPlan.maxDrivers ?? 999, d + 1))}
                  style={{ width: 28, height: 28, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6 }}
                >
                  <LuPlus size={12} />
                </button>
              </div>
              <span style={{ fontSize: '0.72rem', color: '#6b7a99' }}>max {selectedPlan.maxDrivers}</span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '0.7rem', color: '#6b7a99', margin: '0 0 2px' }}>Estimated monthly</p>
              <p style={{ fontSize: '1.25rem', fontWeight: 800, color: '#3b6fd4', margin: 0 }}>
                R{(selectedPlan.monthlyPrice * driverCount).toLocaleString('en-ZA')}
              </p>
              <p style={{ fontSize: '0.7rem', color: '#6b7a99', margin: 0 }}>
                {driverCount} drivers × R{selectedPlan.monthlyPrice}
              </p>
            </div>
          </div>
        )}

        <button
          onClick={handleChoosePlan}
          disabled={!selected || paying || !selectedPlan || selectedPlan.monthlyPrice === 0}
          style={{ width: '100%', justifyContent: 'center', marginBottom: 8, opacity: selected && !paying && selectedPlan?.monthlyPrice ? 1 : 0.6 }}
        >
          {paying ? 'Opening payment...' : `Subscribe — R${((selectedPlan?.monthlyPrice ?? 0) * driverCount).toLocaleString('en-ZA')}/mo`}
          {!paying && <LuArrowRight size={14} />}
        </button>

        <button
          onClick={handleSignOut}
          className="btn-ghost"
          style={{ width: '100%', justifyContent: 'center', fontSize: '0.8rem', color: '#6b7a99', padding: '0.5rem' }}
        >
          Sign in with a different account
        </button>
      </div>

      <p className="auth-footer">&copy; {new Date().getFullYear()} StratoPOD. All rights reserved.</p>
    </div>
  );
}