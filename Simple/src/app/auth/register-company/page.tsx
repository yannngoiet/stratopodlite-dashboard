'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  LuTruck, LuBuilding2, LuUser, LuMail,
  LuPhone, LuLock, LuCheck, LuArrowRight, LuArrowLeft,
  LuMinus, LuPlus,
} from 'react-icons/lu';
import authService from '@/services/authService';
import planService, { type PlanResponse } from '@/services/planService';
import paymentsService from '@/services/paymentsService';
import { notify } from '@/lib/toast';

const POPULAR_PLAN_CODE = 'business';
const STEPS = ['Company details', 'Admin account', 'Choose plan'];

const cardHeading = (title: string, subtitle: string, center = false) => (
  <div style={{ borderBottom: '3px solid var(--primary)', paddingBottom: '1rem', marginBottom: '1.5rem', textAlign: center ? 'center' : 'left' }}>
    <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-navy)' }}>{title}</h2>
    <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: 'var(--muted-foreground)' }}>{subtitle}</p>
  </div>
);

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [selectedPlan, setSelectedPlan] = useState('business');
  const [driverCount, setDriverCount] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    companyName: '', companyPhone: '',
    firstName: '', lastName: '', email: '', password: '', confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [plans, setPlans] = useState<PlanResponse[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);

  useEffect(() => {
    planService.getAll()
      .then(setPlans)
      .catch(() => notify.error('Failed to load plans', 'Please refresh the page.'))
      .finally(() => setPlansLoading(false));
  }, []);

  useEffect(() => {
    const stored = sessionStorage.getItem('purchase_data');
    if (stored) {
      const data = JSON.parse(stored);
      setForm(data.form);
      setSelectedPlan(data.selectedPlan);
      setDriverCount(data.driverCount);
      setStep(2);
    }
  }, []);

  const set = (key: string, val: string) => {
    setForm(f => ({ ...f, [key]: val }));
    setErrors(e => ({ ...e, [key]: '' }));
  };

  const validateStep0 = () => {
    const e: Record<string, string> = {};
    if (!form.companyName.trim())  e.companyName  = 'Company name is required';
    if (!form.companyPhone.trim()) e.companyPhone = 'Phone number is required';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const validateStep1 = () => {
    const e: Record<string, string> = {};
    if (!form.firstName.trim())   e.firstName = 'First name is required';
    if (!form.lastName.trim())    e.lastName  = 'Last name is required';
    if (!form.email.trim())       e.email     = 'Email is required';
    if (form.password.length < 8) e.password  = 'Minimum 8 characters';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const next = () => {
    if (step === 0 && !validateStep0()) return;
    if (step === 1 && !validateStep1()) return;
    setStep(s => s + 1);
  };

  const plan = plans.find(p => p.code === selectedPlan);

  const handleSubmit = async (mode: 'trial' | 'demo' | 'buy' = 'trial') => {
    setSubmitting(true);
    try {
      const companyRes = await authService.registerCompany({
        companyName:          form.companyName,
        companyType:          'ORGANISATION',
        adminPhoneNumber:     form.companyPhone || undefined,
        adminFirstName:       form.firstName,
        adminLastName:        form.lastName,
        adminUsername:        form.email,
        adminEmail:           form.email,
        adminPassword:        form.password,
        planId:               selectedPlan,
        estimatedDriverCount: driverCount,
        requestDemo:          mode === 'demo',
      });

      if (mode === 'demo') {
        notify.info('Demo request received', 'Our team will contact you within 1 business day.');
        setTimeout(() => router.push('/auth/sign-in'), 2000);
        return;
      }

      if (mode === 'buy') {
        const totalAmount = (plan?.monthlyPrice ?? 0) * driverCount;
        const { uuid } = await paymentsService.createOnsiteUuid({
          companyId:    companyRes.id,
          planId:       plan!.id,
          amount:       totalAmount,
          itemName:     `${plan!.name} Plan - ${driverCount} driver${driverCount !== 1 ? 's' : ''}`,
          emailAddress: form.email,
        });

        // Load PayFast onsite engine if not already loaded
        if (!(window as any).payfast_do_onsite_payment) {
          await new Promise<void>((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://sandbox.payfast.co.za/onsite/engine.js';
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('Failed to load PayFast'));
            document.head.appendChild(script);
          });
        }

        setSubmitting(false);

        (window as any).payfast_do_onsite_payment({ uuid }, async (result: boolean) => {
          if (result) {
            setSubmitting(true);
            await authService.login(form.email, form.password);
            notify.success('Payment successful!', `Your ${plan!.name} plan is now active. Welcome to StratoPOD!`);
            setTimeout(() => router.push('/dashboard'), 1500);
          } else {
            notify.error('Payment cancelled', 'Your payment was not completed. Please try again.');
          }
          setSubmitting(false);
        });
        return;
      }

      await authService.login(form.email, form.password);
      notify.success('Account created!', 'Your 14-day free trial has started. Welcome to StratoPOD.');
      setTimeout(() => router.push('/dashboard'), 1500);
    } catch (err: any) {
      const message = err?.response?.data?.message ?? err?.message ?? 'Registration failed. Please try again.';
      notify.error('Registration failed', message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page" style={{ justifyContent: 'flex-start' }}>

      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
        <div className="auth-logo-circle" style={{ width: 72, height: 72 }}>
          <LuTruck size={34} color="#fff" />
        </div>
        <p className="auth-logo-text">STRATO<span className="auth-logo-accent">POD</span></p>
        <p className="auth-logo-sub">Electronic Proof of Delivery</p>
      </div>

      {/* Steps */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
        {STEPS.map((label, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: i <= step ? 'var(--primary)' : 'var(--color-step-inactive)',
                color: '#fff', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: '0.78rem', fontWeight: 700,
              }}>
                {i < step ? <LuCheck size={14} /> : i + 1}
              </div>
              <span style={{ fontSize: '0.65rem', fontWeight: 600, color: i <= step ? 'var(--primary)' : 'var(--muted-foreground)', whiteSpace: 'nowrap' }}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{ width: 56, height: 2, background: i < step ? 'var(--primary)' : 'var(--color-step-inactive)', margin: '0 8px', marginBottom: 18 }} />
            )}
          </div>
        ))}
      </div>

      {/* Card */}
      <div style={{
        background: '#fff', borderRadius: 12,
        padding: step === 2 ? '1.75rem' : '2rem',
        width: '100%', maxWidth: step === 2 ? '920px' : '440px',
        boxShadow: '0 4px 24px var(--color-shadow-blue)',
      }}>

        {/* STEP 0 — Company details */}
        {step === 0 && (
          <>
            {cardHeading('Company details', 'Tell us about your company')}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="field-label">Company name *</label>
                <div className={`input-wrapper${errors.companyName ? ' has-error' : ''}`}>
                  <LuBuilding2 size={15} className="dash-text-muted" />
                  <input className="raw-input" placeholder="Acme Logistics" value={form.companyName} onChange={e => set('companyName', e.target.value)} />
                </div>
                {errors.companyName && <p className="field-error">{errors.companyName}</p>}
              </div>
              <div>
                <label className="field-label">Phone number *</label>
                <div className={`input-wrapper${errors.companyPhone ? ' has-error' : ''}`}>
                  <LuPhone size={15} className="dash-text-muted" />
                  <input className="raw-input" type="tel" placeholder="+27 11 000 0000" value={form.companyPhone} onChange={e => set('companyPhone', e.target.value)} />
                </div>
                {errors.companyPhone && <p className="field-error">{errors.companyPhone}</p>}
              </div>
            </div>
            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Link href="/auth/sign-in" className="auth-link">Already have an account?</Link>
              <button onClick={next}>Next <LuArrowRight size={14} /></button>
            </div>
          </>
        )}

        {/* STEP 1 — Admin account */}
        {step === 1 && (
          <>
            {cardHeading('Admin account', 'Create your dashboard login')}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: '0.75rem' }}>
                <div>
                  <label className="field-label">First name *</label>
                  <div className={`input-wrapper${errors.firstName ? ' has-error' : ''}`}>
                    <LuUser size={15} className="dash-text-muted" />
                    <input className="raw-input" placeholder="John" value={form.firstName} onChange={e => set('firstName', e.target.value)} />
                  </div>
                  {errors.firstName && <p className="field-error">{errors.firstName}</p>}
                </div>
                <div>
                  <label className="field-label">Last name *</label>
                  <div className={`input-wrapper${errors.lastName ? ' has-error' : ''}`}>
                    <input className="raw-input no-icon" placeholder="Smith" value={form.lastName} onChange={e => set('lastName', e.target.value)} />
                  </div>
                  {errors.lastName && <p className="field-error">{errors.lastName}</p>}
                </div>
              </div>
              <div>
                <label className="field-label">Email address *</label>
                <div className={`input-wrapper${errors.email ? ' has-error' : ''}`}>
                  <LuMail size={15} className="dash-text-muted" />
                  <input className="raw-input" type="email" placeholder="john@company.co.za" value={form.email} onChange={e => set('email', e.target.value)} />
                </div>
                {errors.email && <p className="field-error">{errors.email}</p>}
              </div>
              <div>
                <label className="field-label">Password *</label>
                <div className={`input-wrapper${errors.password ? ' has-error' : ''}`}>
                  <LuLock size={15} className="dash-text-muted" />
                  <input className="raw-input" type="password" placeholder="Min. 8 characters" value={form.password} onChange={e => set('password', e.target.value)} />
                </div>
                {errors.password && <p className="field-error">{errors.password}</p>}
              </div>
              <div>
                <label className="field-label">Confirm password *</label>
                <div className={`input-wrapper${errors.confirmPassword ? ' has-error' : ''}`}>
                  <LuLock size={15} className="dash-text-muted" />
                  <input className="raw-input" type="password" placeholder="Repeat password" value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} />
                </div>
                {errors.confirmPassword && <p className="field-error">{errors.confirmPassword}</p>}
              </div>
            </div>
            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between' }}>
              <button onClick={() => setStep(0)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0.5rem 1.25rem', borderRadius: '2rem', fontWeight: 500, border: '1px solid var(--border)', background: '#fff', color: 'var(--color-navy)', cursor: 'pointer', outline: 'none' }}>
                <LuArrowLeft size={14} /> Back
              </button>
              <button onClick={next} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0.5rem 1.5rem', borderRadius: '2rem', fontWeight: 600, background: 'var(--primary)', color: '#fff', border: 'none', cursor: 'pointer', outline: 'none' }}>
                Next <LuArrowRight size={14} />
              </button>
            </div>
          </>
        )}

        {/* STEP 2 — Choose plan */}
        {step === 2 && (
          <>
            {cardHeading('Choose your plan', 'Priced per driver per month. 14-day free trial — no card required.', true)}

            {plansLoading ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted-foreground)', fontSize: '0.875rem' }}>Loading plans...</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
                {plans.map(p => {
                  const sel = selectedPlan === p.code;
                  const isPremium = p.code === 'premium';
                  const accent = isPremium ? 'var(--color-teal)' : 'var(--primary)';
                  const popular = p.code === POPULAR_PLAN_CODE;
                  return (
                    <div
                      key={p.code}
                      onClick={() => setSelectedPlan(p.code)}
                      style={{
                        border: sel ? `2px solid ${accent}` : '1.5px solid var(--border)',
                        borderRadius: 0, padding: '1.25rem 1rem',
                        cursor: 'pointer', position: 'relative',
                        background: sel ? (isPremium ? 'var(--color-teal-soft)' : 'var(--color-blue-soft)') : '#fff',
                        transition: 'all 0.15s',
                      }}
                    >
                      {popular && (
                        <div style={{
                          position: 'absolute', top: -11, left: '50%', transform: 'translateX(-50%)',
                          background: 'var(--primary)', color: '#fff',
                          fontSize: '0.6rem', fontWeight: 700,
                          padding: '2px 10px', borderRadius: 0,
                          whiteSpace: 'nowrap', letterSpacing: '0.5px',
                        }}>
                          MOST POPULAR
                        </div>
                      )}
                      {sel && (
                        <div style={{
                          position: 'absolute', top: 10, right: 10,
                          width: 20, height: 20, borderRadius: '50%',
                          background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <LuCheck size={11} color="#fff" />
                        </div>
                      )}
                      <p style={{ fontSize: '0.7rem', fontWeight: 700, color: accent, textTransform: 'uppercase', letterSpacing: '0.8px', margin: '0 0 6px' }}>
                        {p.name}
                      </p>
                      {p.monthlyPrice > 0 ? (
                        <div style={{ marginBottom: '0.75rem' }}>
                          <span style={{ fontSize: '1.55rem', fontWeight: 800, color: 'var(--color-navy)' }}>R{p.monthlyPrice}</span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)' }}>/driver/mo</span>
                        </div>
                      ) : (
                        <div style={{ marginBottom: '0.75rem' }}>
                          <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-teal)' }}>Contact us</span>
                        </div>
                      )}
                      <div style={{ height: 1, background: 'var(--border)', marginBottom: '0.75rem' }} />
                      {p.features.map((f: string, i: number) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 6, marginBottom: 5 }}>
                          <LuCheck size={12} color={sel ? accent : 'var(--border)'} style={{ marginTop: 2, flexShrink: 0 }} />
                          <span style={{ fontSize: '0.73rem', color: 'var(--muted-foreground)', lineHeight: 1.4 }}>{f}</span>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            )}

            {plan && plan.monthlyPrice > 0 && (
              <div style={{
                background: 'var(--color-blue-soft)', border: '1.5px solid var(--border)',
                borderRadius: 0, padding: '1rem 1.25rem', marginBottom: '1.25rem',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--color-navy)', fontWeight: 600 }}>How many drivers?</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <button className="btn-stepper"
                      onClick={() => setDriverCount(d => Math.max(1, d - 1))}
                      style={{ width: 32, height: 32, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', flexShrink: 0 }}>
                      <LuMinus size={14} />
                    </button>
                    <span style={{ minWidth: 48, textAlign: 'center', fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary)', background: '#fff', border: '1.5px solid var(--border)', borderRadius: '8px', padding: '4px 10px' }}>
                      {driverCount}
                    </span>
                    <button className="btn-stepper"
                      onClick={() => setDriverCount(d => Math.min(plan?.maxDrivers ?? 999, d + 1))}
                      style={{ width: 32, height: 32, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', flexShrink: 0 }}>
                      <LuPlus size={14} />
                    </button>
                  </div>
                  <span style={{ fontSize: '0.73rem', color: 'var(--muted-foreground)' }}>max {plan?.maxDrivers} on this plan</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '0.72rem', color: 'var(--muted-foreground)', margin: '0 0 2px' }}>Estimated monthly</p>
                  <p style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)', margin: 0 }}>
                    R{((plan?.monthlyPrice ?? 0) * driverCount).toLocaleString('en-ZA')}
                  </p>
                  <p style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)', margin: 0 }}>{driverCount} drivers × R{plan?.monthlyPrice}</p>
                </div>
              </div>
            )}

            <div className="auth-teal-note">
              <LuCheck size={15} color="var(--color-teal)" style={{ marginTop: 2, flexShrink: 0 }} />
              <p className="auth-teal-note-text">
                Your 14-day free trial starts today. No credit card required until your trial ends.
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button onClick={() => setStep(1)} disabled={submitting}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0.5rem 1.25rem', borderRadius: '2rem', fontWeight: 500, border: '1px solid var(--border)', background: '#fff', color: 'var(--color-navy)', cursor: 'pointer', opacity: submitting ? 0.6 : 1, outline: 'none' }}>
                <LuArrowLeft size={14} /> Back
              </button>
              {plan && plan.monthlyPrice > 0 ? (
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={() => handleSubmit('trial')} disabled={submitting}
                    style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '0.6rem 1.5rem', borderRadius: '2rem', fontWeight: 600, background: 'var(--primary)', color: '#fff', border: 'none', cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1, boxShadow: '0 2px 8px rgba(59,111,212,0.35)', outline: 'none' }}>
                    {submitting ? 'Creating...' : 'Start free trial'}
                  </button>
                  <button onClick={() => handleSubmit('buy')} disabled={submitting}
                    style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '0.6rem 1.5rem', borderRadius: '2rem', fontWeight: 600, background: 'var(--color-green)', color: '#fff', border: 'none', cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1, boxShadow: '0 2px 8px rgba(34,197,94,0.35)', outline: 'none' }}>
                    {submitting ? 'Processing...' : 'Buy Now'}
                  </button>
                </div>
              ) : (
                <button onClick={() => handleSubmit('demo')} disabled={submitting}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0.5rem 1.75rem', borderRadius: '2rem', fontWeight: 600, background: 'var(--color-teal)', color: '#fff', border: 'none', cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1, outline: 'none' }}>
                  {submitting ? 'Sending request...' : 'Request a demo'} <LuArrowRight size={14} />
                </button>
              )}
            </div>
          </>
        )}
      </div>

      <p className="auth-footer">
        &copy; {new Date().getFullYear()} StratoPOD. All rights reserved.
      </p>

    </div>
  );
}
