'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  LuTruck, LuBuilding2, LuUser, LuMail,
  LuPhone, LuLock, LuCheck, LuArrowRight, LuArrowLeft,
} from 'react-icons/lu';

/* ── Pro Tech color tokens ── */
const C = {
  primary:   '#3b6fd4',
  teal:      '#29b6c5',
  bg:        '#f0f2f5',
  card:      '#ffffff',
  text:      '#1a2340',
  muted:     '#6b7a99',
  border:    '#dde3f0',
  inputBg:   '#f8f9fc',
  err:       '#e03a3a',
  blueSoft:  '#f0f5ff',
  tealSoft:  '#f0fbfc',
  tealBorder:'#b2e8ed',
};

const PLANS = [
  {
    id: 'starter', name: 'Starter', price: 350,
    maxDrivers: 10, maxDispatchers: 2, popular: false, accent: C.primary,
    features: ['Up to 10 drivers', '2 dashboard users', 'Proof of delivery', 'Digital signatures', 'Email support'],
  },
  {
    id: 'business', name: 'Business', price: 330,
    maxDrivers: 20, maxDispatchers: 5, popular: true, accent: C.primary,
    features: ['Up to 20 drivers', '5 dashboard users', 'Proof of delivery', 'Digital signatures', 'Priority support', 'Basic reports'],
  },
  {
    id: 'professional', name: 'Professional', price: 300,
    maxDrivers: 50, maxDispatchers: 10, popular: false, accent: C.primary,
    features: ['Up to 50 drivers', '10 dashboard users', 'Proof of delivery', 'Digital signatures', 'Dedicated support', 'Advanced reports', 'API access'],
  },
  {
    id: 'premium', name: 'Premium', price: null,
    maxDrivers: null, maxDispatchers: null, popular: false, accent: C.teal,
    features: ['Unlimited drivers', 'Unlimited users', 'Proof of delivery', 'Digital signatures', 'SLA support', 'Custom reports', 'API access', 'Custom integrations'],
  },
];

const STEPS = ['Company details', 'Admin account', 'Choose plan'];

/* ── Shared style helpers ── */
const fieldLabel: React.CSSProperties = {
  fontSize: '0.78rem', fontWeight: 600,
  color: C.text, display: 'block', marginBottom: 6,
};

const inputRow = (hasErr: boolean): React.CSSProperties => ({
  display: 'flex', alignItems: 'center',
  border: `1.5px solid ${hasErr ? C.err : C.border}`,
  borderRadius: 8, background: C.inputBg,
  overflow: 'hidden', paddingLeft: '0.75rem',
});

const rawInput: React.CSSProperties = {
  flex: 1, border: 'none', outline: 'none',
  padding: '0.65rem 0.75rem 0.65rem 0',
  fontSize: '0.875rem', color: C.text, background: 'transparent',
};

const btnPrimary = (accent = C.primary): React.CSSProperties => ({
  background: accent, color: '#fff', border: 'none',
  borderRadius: 8, padding: '0.55rem 1.5rem',
  fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer',
  display: 'inline-flex', alignItems: 'center', gap: 6,
});

const btnOutline: React.CSSProperties = {
  background: 'transparent', color: C.text,
  border: `1.5px solid ${C.border}`,
  borderRadius: 8, padding: '0.55rem 1.25rem',
  fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer',
  display: 'inline-flex', alignItems: 'center', gap: 6,
};

const cardHeading = (title: string, subtitle: string, center = false) => (
  <div style={{ borderBottom: `3px solid ${C.primary}`, paddingBottom: '1rem', marginBottom: '1.5rem', textAlign: center ? 'center' : 'left' }}>
    <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: C.text }}>{title}</h2>
    <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: C.muted }}>{subtitle}</p>
  </div>
);

const ErrMsg = ({ msg }: { msg?: string }) =>
  msg ? <p style={{ color: C.err, fontSize: '0.73rem', margin: '4px 0 0' }}>{msg}</p> : null;

/* ══════════════════════════════════════════════ */
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
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', padding: '2rem 1rem' }}>

      {/* ── Logo ── */}
      <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
        <div style={{ width: 72, height: 72, background: C.primary, borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.6rem' }}>
          <LuTruck size={34} color="#fff" />
        </div>
        <p style={{ margin: 0, fontWeight: 800, fontSize: '1.3rem', letterSpacing: '1px', color: C.text }}>
          STRATO<span style={{ color: C.teal }}>POD</span>
        </p>
        <p style={{ margin: '3px 0 0', fontSize: '0.7rem', fontWeight: 600, color: C.muted, letterSpacing: '2px', textTransform: 'uppercase' }}>
          Electronic Proof of Delivery
        </p>
      </div>

      {/* ── Step indicator ── */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
        {STEPS.map((label, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: i <= step ? C.primary : '#d5daea',
                color: '#fff', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: '0.78rem', fontWeight: 700,
              }}>
                {i < step ? <LuCheck size={14} /> : i + 1}
              </div>
              <span style={{ fontSize: '0.65rem', fontWeight: 600, color: i <= step ? C.primary : C.muted, whiteSpace: 'nowrap' }}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{ width: 56, height: 2, background: i < step ? C.primary : '#d5daea', margin: '0 8px', marginBottom: 18 }} />
            )}
          </div>
        ))}
      </div>

      {/* ── Card ── */}
      <div style={{
        background: C.card, borderRadius: 12,
        padding: step === 2 ? '1.75rem' : '2rem',
        width: '100%', maxWidth: step === 2 ? '920px' : '440px',
        boxShadow: '0 4px 24px rgba(59,111,212,0.1)',
      }}>

        {/* ════ STEP 0 — Company details ════ */}
        {step === 0 && (
          <>
            {cardHeading('Company details', 'Tell us about your company')}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

              <div>
                <label style={fieldLabel}>Company name *</label>
                <div style={inputRow(!!errors.companyName)}>
                  <LuBuilding2 size={15} color={C.muted} />
                  <input placeholder="Acme Logistics" value={form.companyName} onChange={e => set('companyName', e.target.value)} style={rawInput} />
                </div>
                <ErrMsg msg={errors.companyName} />
              </div>

              <div>
                <label style={fieldLabel}>Company email *</label>
                <div style={inputRow(!!errors.companyEmail)}>
                  <LuMail size={15} color={C.muted} />
                  <input type="email" placeholder="info@company.co.za" value={form.companyEmail} onChange={e => set('companyEmail', e.target.value)} style={rawInput} />
                </div>
                <ErrMsg msg={errors.companyEmail} />
              </div>

              <div>
                <label style={fieldLabel}>Phone number *</label>
                <div style={inputRow(!!errors.companyPhone)}>
                  <LuPhone size={15} color={C.muted} />
                  <input type="tel" placeholder="+27 11 000 0000" value={form.companyPhone} onChange={e => set('companyPhone', e.target.value)} style={rawInput} />
                </div>
                <ErrMsg msg={errors.companyPhone} />
              </div>

              <div>
                <label style={fieldLabel}>
                  Address <span style={{ color: C.muted, fontWeight: 400 }}>(optional)</span>
                </label>
                <div style={inputRow(false)}>
                  <input placeholder="123 Main Street, Johannesburg" value={form.companyAddress} onChange={e => set('companyAddress', e.target.value)} style={{ ...rawInput, paddingLeft: 0 }} />
                </div>
              </div>

            </div>

            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Link href="/auth/sign-in" style={{ fontSize: '0.8rem', color: C.primary, textDecoration: 'none', fontWeight: 500 }}>
                Already have an account?
              </Link>
              <button onClick={next} style={btnPrimary()}>
                Next <LuArrowRight size={14} />
              </button>
            </div>
          </>
        )}

        {/* ════ STEP 1 — Admin account ════ */}
        {step === 1 && (
          <>
            {cardHeading('Admin account', 'Create your dashboard login')}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={fieldLabel}>First name *</label>
                  <div style={inputRow(!!errors.firstName)}>
                    <LuUser size={15} color={C.muted} />
                    <input placeholder="John" value={form.firstName} onChange={e => set('firstName', e.target.value)} style={rawInput} />
                  </div>
                  <ErrMsg msg={errors.firstName} />
                </div>
                <div>
                  <label style={fieldLabel}>Last name *</label>
                  <div style={inputRow(!!errors.lastName)}>
                    <input placeholder="Smith" value={form.lastName} onChange={e => set('lastName', e.target.value)} style={{ ...rawInput, paddingLeft: 0 }} />
                  </div>
                  <ErrMsg msg={errors.lastName} />
                </div>
              </div>

              <div>
                <label style={fieldLabel}>Email address *</label>
                <div style={inputRow(!!errors.email)}>
                  <LuMail size={15} color={C.muted} />
                  <input type="email" placeholder="john@company.co.za" value={form.email} onChange={e => set('email', e.target.value)} style={rawInput} />
                </div>
                <ErrMsg msg={errors.email} />
              </div>

              <div>
                <label style={fieldLabel}>Password *</label>
                <div style={inputRow(!!errors.password)}>
                  <LuLock size={15} color={C.muted} />
                  <input type="password" placeholder="Min. 8 characters" value={form.password} onChange={e => set('password', e.target.value)} style={rawInput} />
                </div>
                <ErrMsg msg={errors.password} />
              </div>

              <div>
                <label style={fieldLabel}>Confirm password *</label>
                <div style={inputRow(!!errors.confirmPassword)}>
                  <LuLock size={15} color={C.muted} />
                  <input type="password" placeholder="Repeat password" value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} style={rawInput} />
                </div>
                <ErrMsg msg={errors.confirmPassword} />
              </div>

            </div>

            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between' }}>
              <button onClick={() => setStep(0)} style={btnOutline}>
                <LuArrowLeft size={14} /> Back
              </button>
              <button onClick={next} style={btnPrimary()}>
                Next <LuArrowRight size={14} />
              </button>
            </div>
          </>
        )}

        {/* ════ STEP 2 — Choose plan ════ */}
        {step === 2 && (
          <>
            {cardHeading('Choose your plan', 'Priced per driver per month. 14-day free trial — no card required.', true)}

            {/* Plan grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
              {PLANS.map(p => {
                const sel = selectedPlan === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => setSelectedPlan(p.id)}
                    style={{
                      border: sel ? `2px solid ${p.accent}` : `1.5px solid ${C.border}`,
                      borderRadius: 10, padding: '1.25rem 1rem',
                      cursor: 'pointer', position: 'relative',
                      background: sel ? (p.accent === C.teal ? C.tealSoft : C.blueSoft) : C.card,
                      transition: 'all 0.15s',
                    }}
                  >
                    {p.popular && (
                      <div style={{
                        position: 'absolute', top: -11, left: '50%', transform: 'translateX(-50%)',
                        background: C.primary, color: '#fff',
                        fontSize: '0.6rem', fontWeight: 700,
                        padding: '2px 10px', borderRadius: 20,
                        whiteSpace: 'nowrap', letterSpacing: '0.5px',
                      }}>
                        MOST POPULAR
                      </div>
                    )}

                    {sel && (
                      <div style={{
                        position: 'absolute', top: 10, right: 10,
                        width: 20, height: 20, borderRadius: '50%',
                        background: p.accent, display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                      }}>
                        <LuCheck size={11} color="#fff" />
                      </div>
                    )}

                    <p style={{ fontSize: '0.7rem', fontWeight: 700, color: p.accent, textTransform: 'uppercase', letterSpacing: '0.8px', margin: '0 0 6px' }}>
                      {p.name}
                    </p>

                    {p.price ? (
                      <div style={{ marginBottom: '0.75rem' }}>
                        <span style={{ fontSize: '1.55rem', fontWeight: 800, color: C.text }}>R{p.price}</span>
                        <span style={{ fontSize: '0.7rem', color: C.muted }}>/driver/mo</span>
                      </div>
                    ) : (
                      <div style={{ marginBottom: '0.75rem' }}>
                        <span style={{ fontSize: '1rem', fontWeight: 700, color: C.teal }}>Contact us</span>
                      </div>
                    )}

                    <div style={{ height: 1, background: C.border, marginBottom: '0.75rem' }} />

                    {p.features.map((f, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 6, marginBottom: 5 }}>
                        <LuCheck size={12} color={sel ? p.accent : C.border} style={{ marginTop: 2, flexShrink: 0 }} />
                        <span style={{ fontSize: '0.73rem', color: C.muted, lineHeight: 1.4 }}>{f}</span>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>

            {/* Driver count + estimate */}
            {plan.price && (
              <div style={{
                background: C.blueSoft, border: `1.5px solid ${C.border}`,
                borderRadius: 10, padding: '1rem 1.25rem',
                marginBottom: '1.25rem',
                display: 'flex', alignItems: 'center',
                justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: '0.82rem', color: C.text, fontWeight: 600 }}>How many drivers?</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {[
                      { label: '−', fn: () => setDriverCount(d => Math.max(1, d - 1)) },
                      { label: '+', fn: () => setDriverCount(d => Math.min(plan.maxDrivers ?? 999, d + 1)) },
                    ].map((btn, i) => i === 0 ? (
                      <button key={i} onClick={btn.fn} style={{ width: 28, height: 28, borderRadius: '50%', border: `1.5px solid ${C.border}`, background: C.card, cursor: 'pointer', fontSize: '1rem', color: C.text, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{btn.label}</button>
                    ) : (
                      <>
                        <span style={{ fontSize: '1.1rem', fontWeight: 700, minWidth: 28, textAlign: 'center', color: C.primary }}>{driverCount}</span>
                        <button key={i} onClick={btn.fn} style={{ width: 28, height: 28, borderRadius: '50%', border: `1.5px solid ${C.border}`, background: C.card, cursor: 'pointer', fontSize: '1rem', color: C.text, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{btn.label}</button>
                      </>
                    ))}
                  </div>
                  <span style={{ fontSize: '0.73rem', color: C.muted }}>max {plan.maxDrivers} on this plan</span>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '0.72rem', color: C.muted, margin: '0 0 2px' }}>Estimated monthly</p>
                  <p style={{ fontSize: '1.5rem', fontWeight: 800, color: C.primary, margin: 0 }}>
                    R{(plan.price * driverCount).toLocaleString('en-ZA')}
                  </p>
                  <p style={{ fontSize: '0.7rem', color: C.muted, margin: 0 }}>{driverCount} drivers × R{plan.price}</p>
                </div>
              </div>
            )}

            {/* Trial note */}
            <div style={{
              background: C.tealSoft, border: `1.5px solid ${C.tealBorder}`,
              borderRadius: 8, padding: '0.75rem 1rem', marginBottom: '1.25rem',
              display: 'flex', alignItems: 'flex-start', gap: 10,
            }}>
              <LuCheck size={15} color={C.teal} style={{ marginTop: 2, flexShrink: 0 }} />
              <p style={{ fontSize: '0.78rem', color: '#1a6b75', margin: 0, lineHeight: 1.5 }}>
                Your 14-day free trial starts today. No credit card required until your trial ends.
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button onClick={() => setStep(1)} style={btnOutline}>
                <LuArrowLeft size={14} /> Back
              </button>
              <button style={btnPrimary(plan.accent)}>
                {plan.price ? 'Start free trial' : 'Request a demo'} <LuArrowRight size={14} />
              </button>
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <p style={{ marginTop: '1.5rem', fontSize: '0.72rem', color: C.muted }}>
        &copy; {new Date().getFullYear()} StratoPOD. All rights reserved.
      </p>

    </div>
  );
}