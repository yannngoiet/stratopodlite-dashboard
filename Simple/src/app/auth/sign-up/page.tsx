'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  LuTruck, LuBuilding2, LuUser, LuMail,
  LuPhone, LuLock, LuCheck, LuArrowRight, LuArrowLeft,
} from 'react-icons/lu';

const PLANS = [
  {
    id: 'starter', name: 'Starter', price: 350,
    maxDrivers: 10, popular: false, accent: 'var(--primary)',
    features: ['Up to 10 drivers', '2 dashboard users', 'Proof of delivery', 'Digital signatures', 'Email support'],
  },
  {
    id: 'business', name: 'Business', price: 330,
    maxDrivers: 20, popular: true, accent: 'var(--primary)',
    features: ['Up to 20 drivers', '5 dashboard users', 'Proof of delivery', 'Digital signatures', 'Priority support', 'Basic reports'],
  },
  {
    id: 'professional', name: 'Professional', price: 300,
    maxDrivers: 50, popular: false, accent: 'var(--primary)',
    features: ['Up to 50 drivers', '10 dashboard users', 'Proof of delivery', 'Digital signatures', 'Dedicated support', 'Advanced reports', 'API access'],
  },
  {
    id: 'premium', name: 'Premium', price: null,
    maxDrivers: null, popular: false, accent: 'var(--color-teal)',
    features: ['Unlimited drivers', 'Unlimited users', 'Proof of delivery', 'Digital signatures', 'SLA support', 'Custom reports', 'API access', 'Custom integrations'],
  },
];

const STEPS = ['Company details', 'Admin account', 'Choose plan'];

const cardHeading = (title: string, subtitle: string, center = false) => (
  <div style={{ borderBottom: '3px solid var(--primary)', paddingBottom: '1rem', marginBottom: '1.5rem', textAlign: center ? 'center' : 'left' }}>
    <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-navy)' }}>{title}</h2>
    <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: 'var(--muted-foreground)' }}>{subtitle}</p>
  </div>
);

const ErrMsg = ({ msg }: { msg?: string }) =>
  msg ? <p style={{ color: 'var(--color-error)', fontSize: '0.73rem', margin: '4px 0 0' }}>{msg}</p> : null;

export default function RegisterPage() {
  const [step, setStep] = useState(0);
  const [selectedPlan, setSelectedPlan] = useState('business');
  const [driverCount, setDriverCount] = useState(5);
  const [form, setForm] = useState({
    companyName: '', companyEmail: '', companyPhone: '', companyAddress: '',
    firstName: '', lastName: '', email: '', password: '', confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (key: string, val: string) => {
    setForm(f => ({ ...f, [key]: val }));
    setErrors(e => ({ ...e, [key]: '' }));
  };

  const validateStep0 = () => {
    const e: Record<string, string> = {};
    if (!form.companyName.trim())  e.companyName  = 'Company name is required';
    if (!form.companyEmail.trim()) e.companyEmail = 'Company email is required';
    if (!form.companyPhone.trim()) e.companyPhone = 'Phone number is required';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const validateStep1 = () => {
    const e: Record<string, string> = {};
    if (!form.firstName.trim())  e.firstName = 'First name is required';
    if (!form.lastName.trim())   e.lastName  = 'Last name is required';
    if (!form.email.trim())      e.email     = 'Email is required';
    if (form.password.length < 8) e.password = 'Minimum 8 characters';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const next = () => {
    if (step === 0 && !validateStep0()) return;
    if (step === 1 && !validateStep1()) return;
    setStep(s => s + 1);
  };

  const plan = PLANS.find(p => p.id === selectedPlan)!;

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
                <ErrMsg msg={errors.companyName} />
              </div>
              <div>
                <label className="field-label">Company email *</label>
                <div className={`input-wrapper${errors.companyEmail ? ' has-error' : ''}`}>
                  <LuMail size={15} className="dash-text-muted" />
                  <input className="raw-input" type="email" placeholder="info@company.co.za" value={form.companyEmail} onChange={e => set('companyEmail', e.target.value)} />
                </div>
                <ErrMsg msg={errors.companyEmail} />
              </div>
              <div>
                <label className="field-label">Phone number *</label>
                <div className={`input-wrapper${errors.companyPhone ? ' has-error' : ''}`}>
                  <LuPhone size={15} className="dash-text-muted" />
                  <input className="raw-input" type="tel" placeholder="+27 11 000 0000" value={form.companyPhone} onChange={e => set('companyPhone', e.target.value)} />
                </div>
                <ErrMsg msg={errors.companyPhone} />
              </div>
              <div>
                <label className="field-label">Address <span style={{ color: 'var(--muted-foreground)', fontWeight: 400 }}>(optional)</span></label>
                <div className="input-wrapper">
                  <input className="raw-input no-icon" placeholder="123 Main Street, Johannesburg" value={form.companyAddress} onChange={e => set('companyAddress', e.target.value)} />
                </div>
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
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label className="field-label">First name *</label>
                  <div className={`input-wrapper${errors.firstName ? ' has-error' : ''}`}>
                    <LuUser size={15} className="dash-text-muted" />
                    <input className="raw-input" placeholder="John" value={form.firstName} onChange={e => set('firstName', e.target.value)} />
                  </div>
                  <ErrMsg msg={errors.firstName} />
                </div>
                <div>
                  <label className="field-label">Last name *</label>
                  <div className={`input-wrapper${errors.lastName ? ' has-error' : ''}`}>
                    <input className="raw-input no-icon" placeholder="Smith" value={form.lastName} onChange={e => set('lastName', e.target.value)} />
                  </div>
                  <ErrMsg msg={errors.lastName} />
                </div>
              </div>
              <div>
                <label className="field-label">Email address *</label>
                <div className={`input-wrapper${errors.email ? ' has-error' : ''}`}>
                  <LuMail size={15} className="dash-text-muted" />
                  <input className="raw-input" type="email" placeholder="john@company.co.za" value={form.email} onChange={e => set('email', e.target.value)} />
                </div>
                <ErrMsg msg={errors.email} />
              </div>
              <div>
                <label className="field-label">Password *</label>
                <div className={`input-wrapper${errors.password ? ' has-error' : ''}`}>
                  <LuLock size={15} className="dash-text-muted" />
                  <input className="raw-input" type="password" placeholder="Min. 8 characters" value={form.password} onChange={e => set('password', e.target.value)} />
                </div>
                <ErrMsg msg={errors.password} />
              </div>
              <div>
                <label className="field-label">Confirm password *</label>
                <div className={`input-wrapper${errors.confirmPassword ? ' has-error' : ''}`}>
                  <LuLock size={15} className="dash-text-muted" />
                  <input className="raw-input" type="password" placeholder="Repeat password" value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} />
                </div>
                <ErrMsg msg={errors.confirmPassword} />
              </div>
            </div>
            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between' }}>
              <button onClick={() => setStep(0)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0.55rem 1.25rem', borderRadius: 8, border: '1.5px solid var(--border)', background: 'transparent', color: 'var(--color-navy)', cursor: 'pointer', fontWeight: 600 }}>
                <LuArrowLeft size={14} /> Back
              </button>
              <button onClick={next} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0.55rem 1.5rem', borderRadius: 8, background: 'var(--primary)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                Next <LuArrowRight size={14} />
              </button>
            </div>
          </>
        )}

        {/* STEP 2 — Choose plan */}
        {step === 2 && (
          <>
            {cardHeading('Choose your plan', 'Priced per driver per month. 14-day free trial — no card required.', true)}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
              {PLANS.map(p => {
                const sel = selectedPlan === p.id;
                const isPremium = p.id === 'premium';
                return (
                  <div
                    key={p.id}
                    onClick={() => setSelectedPlan(p.id)}
                    style={{
                      border: sel ? `2px solid ${p.accent}` : '1.5px solid var(--border)',
                      borderRadius: 10, padding: '1.25rem 1rem',
                      cursor: 'pointer', position: 'relative',
                      background: sel ? (isPremium ? 'var(--color-teal-soft)' : 'var(--color-blue-soft)') : '#fff',
                      transition: 'all 0.15s',
                    }}
                  >
                    {p.popular && (
                      <div style={{
                        position: 'absolute', top: -11, left: '50%', transform: 'translateX(-50%)',
                        background: 'var(--primary)', color: '#fff',
                        fontSize: '0.6rem', fontWeight: 700,
                        padding: '2px 10px', borderRadius: 20,
                        whiteSpace: 'nowrap', letterSpacing: '0.5px',
                      }}>MOST POPULAR</div>
                    )}
                    {sel && (
                      <div style={{
                        position: 'absolute', top: 10, right: 10,
                        width: 20, height: 20, borderRadius: '50%',
                        background: p.accent, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <LuCheck size={11} color="#fff" />
                      </div>
                    )}
                    <p style={{ fontSize: '0.7rem', fontWeight: 700, color: p.accent, textTransform: 'uppercase', letterSpacing: '0.8px', margin: '0 0 6px' }}>
                      {p.name}
                    </p>
                    {p.price ? (
                      <div style={{ marginBottom: '0.75rem' }}>
                        <span style={{ fontSize: '1.55rem', fontWeight: 800, color: 'var(--color-navy)' }}>R{p.price}</span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)' }}>/driver/mo</span>
                      </div>
                    ) : (
                      <div style={{ marginBottom: '0.75rem' }}>
                        <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-teal)' }}>Contact us</span>
                      </div>
                    )}
                    <div style={{ height: 1, background: 'var(--border)', marginBottom: '0.75rem' }} />
                    {p.features.map((f, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 6, marginBottom: 5 }}>
                        <LuCheck size={12} color={sel ? p.accent : 'var(--border)'} style={{ marginTop: 2, flexShrink: 0 }} />
                        <span style={{ fontSize: '0.73rem', color: 'var(--muted-foreground)', lineHeight: 1.4 }}>{f}</span>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>

            {plan.price && (
              <div style={{
                background: 'var(--color-blue-soft)', border: '1.5px solid var(--border)',
                borderRadius: 10, padding: '1rem 1.25rem', marginBottom: '1.25rem',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--color-navy)', fontWeight: 600 }}>How many drivers?</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button onClick={() => setDriverCount(d => Math.max(1, d - 1))} style={{ width: 28, height: 28, borderRadius: '50%', border: '1.5px solid var(--border)', background: '#fff', cursor: 'pointer', fontSize: '1rem', color: 'var(--color-navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>−</button>
                    <span style={{ fontSize: '1.1rem', fontWeight: 700, minWidth: 28, textAlign: 'center', color: 'var(--primary)' }}>{driverCount}</span>
                    <button onClick={() => setDriverCount(d => Math.min(plan.maxDrivers ?? 999, d + 1))} style={{ width: 28, height: 28, borderRadius: '50%', border: '1.5px solid var(--border)', background: '#fff', cursor: 'pointer', fontSize: '1rem', color: 'var(--color-navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>+</button>
                  </div>
                  <span style={{ fontSize: '0.73rem', color: 'var(--muted-foreground)' }}>max {plan.maxDrivers} on this plan</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '0.72rem', color: 'var(--muted-foreground)', margin: '0 0 2px' }}>Estimated monthly</p>
                  <p style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)', margin: 0 }}>
                    R{(plan.price * driverCount).toLocaleString('en-ZA')}
                  </p>
                  <p style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)', margin: 0 }}>{driverCount} drivers × R{plan.price}</p>
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
              <button onClick={() => setStep(1)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0.55rem 1.25rem', borderRadius: 8, border: '1.5px solid var(--border)', background: 'transparent', color: 'var(--color-navy)', cursor: 'pointer', fontWeight: 600 }}>
                <LuArrowLeft size={14} /> Back
              </button>
              <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0.55rem 1.5rem', borderRadius: 8, background: plan.accent, color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                {plan.price ? 'Start free trial' : 'Request a demo'} <LuArrowRight size={14} />
              </button>
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
