'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LuTruck, LuBuilding, LuUser, LuMail, LuLock, LuPhone } from 'react-icons/lu';
import authService from '@/services/authService';

const COMPANY_TYPES = ['ORGANISATION', 'SUPPLIER', 'CUSTOMER', 'PARTNER'];

const Page = () => {
  const router  = useRouter();
  const [step, setStep] = useState<1 | 2>(1);

  // ── Step 1 — Company ───────────────────────────────────────────
  const [companyName, setCompanyName] = useState('');
  const [companyType, setCompanyType] = useState('ORGANISATION');

  // ── Step 2 — Admin User ────────────────────────────────────────
  const [firstName, setFirstName] = useState('');
  const [lastName,  setLastName]  = useState('');
  const [username,  setUsername]  = useState('');
  const [email,     setEmail]     = useState('');
  const [password,  setPassword]  = useState('');
  const [phone,     setPhone]     = useState('');

  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // ── Step 1 → Step 2 ───────────────────────────────────────────
  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!companyName.trim()) {
      setError('Company name is required.');
      return;
    }
    setStep(2);
  };

  // ── Step 2 → Submit ───────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!firstName.trim() || !lastName.trim() || !username.trim() ||
        !email.trim()      || !password.trim()) {
      setError('All fields except phone are required.');
      return;
    }

    setLoading(true);
    try {
      await authService.registerCompany({
        companyName:      companyName.trim(),
        companyType,
        adminFirstName:   firstName.trim(),
        adminLastName:    lastName.trim(),
        adminUsername:    username.trim(),
        adminEmail:       email.trim(),
        adminPassword:    password,
        adminPhoneNumber: phone.trim() || undefined,
      });

      setSuccess('Company registered successfully!');
      setTimeout(() => router.push('/auth/sign-in'), 1500);

    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not reach the server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Shared styles ──────────────────────────────────────────────
  const inputRow = {
    display: 'flex', alignItems: 'center',
    border: '1px solid #ddd', borderRadius: '4px',
    marginBottom: '1rem', overflow: 'hidden',
  } as React.CSSProperties;

  const inputStyle = {
    flex: 1, border: 'none', outline: 'none',
    padding: '0.6rem 0.75rem', fontSize: '0.875rem', color: '#333',
  } as React.CSSProperties;

  const iconStyle = { padding: '0 0.75rem', color: '#aaa' };

  return (
    <div style={{
      minHeight: '100vh', background: '#e8eae8',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '2rem 1rem',
    }}>

      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <div style={{
          width: 80, height: 80, background: '#1a1a1a',
          borderRadius: '50%', display: 'inline-flex',
          alignItems: 'center', justifyContent: 'center',
          marginBottom: '0.75rem', boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
        }}>
          <LuTruck size={38} color="#fff" />
        </div>
        <p style={{
          color: '#444', fontSize: '0.78rem', fontWeight: 600,
          letterSpacing: '2px', textTransform: 'uppercase', margin: 0,
        }}>
          Electronic Proof of Delivery
        </p>
      </div>

      {/* Card */}
      <div style={{
        background: '#fff', borderRadius: '6px', padding: '2rem',
        width: '100%', maxWidth: '380px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
      }}>

        {/* Step indicator */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
          {[1, 2].map(s => (
            <div key={s} style={{
              width: 28, height: 28, borderRadius: '50%',
              background: step === s ? '#1a1a1a' : '#ddd',
              color: step === s ? '#fff' : '#999',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.75rem', fontWeight: 700,
            }}>{s}</div>
          ))}
        </div>

        <p style={{ textAlign: 'center', color: '#888', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
          {step === 1 ? 'Register your company' : 'Create admin account'}
        </p>

        {/* ── STEP 1 ── */}
        {step === 1 && (
          <form onSubmit={handleStep1}>

            <div style={inputRow}>
              <input
                type="text" placeholder="Company name"
                value={companyName} onChange={e => setCompanyName(e.target.value)}
                required style={inputStyle}
              />
              <span style={iconStyle}><LuBuilding size={16} /></span>
            </div>

            <div style={inputRow}>
              <select
                value={companyType} onChange={e => setCompanyType(e.target.value)}
                style={{ ...inputStyle, background: '#fff' }}
              >
                {COMPANY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <span style={iconStyle}><LuBuilding size={16} /></span>
            </div>

            {error && (
              <div style={{ color: '#c53030', fontSize: '0.82rem', marginBottom: '0.75rem' }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.5rem' }}>
              <Link href="/auth/sign-in" style={{ fontSize: '0.82rem', color: '#1a1a1a', textDecoration: 'none' }}>
                Back to Sign In
              </Link>
              <button type="submit" style={{
                background: '#1a1a1a', color: '#fff', border: 'none',
                borderRadius: '4px', padding: '0.5rem 1.5rem',
                fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer',
              }}>
                Next
              </button>
            </div>
          </form>
        )}

        {/* ── STEP 2 ── */}
        {step === 2 && (
          <form onSubmit={handleSubmit}>

            {/* First + Last name side by side */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <div style={{ ...inputRow, flex: 1, marginBottom: 0 }}>
                <input
                  type="text" placeholder="First name"
                  value={firstName} onChange={e => setFirstName(e.target.value)}
                  required style={inputStyle}
                />
              </div>
              <div style={{ ...inputRow, flex: 1, marginBottom: 0 }}>
                <input
                  type="text" placeholder="Last name"
                  value={lastName} onChange={e => setLastName(e.target.value)}
                  required style={inputStyle}
                />
              </div>
            </div>

            <div style={inputRow}>
              <input
                type="text" placeholder="Username"
                value={username} onChange={e => setUsername(e.target.value)}
                required style={inputStyle}
              />
              <span style={iconStyle}><LuUser size={16} /></span>
            </div>

            <div style={inputRow}>
              <input
                type="email" placeholder="Email"
                value={email} onChange={e => setEmail(e.target.value)}
                required style={inputStyle}
              />
              <span style={iconStyle}><LuMail size={16} /></span>
            </div>

            <div style={inputRow}>
              <input
                type="password" placeholder="Password"
                value={password} onChange={e => setPassword(e.target.value)}
                required style={inputStyle}
              />
              <span style={iconStyle}><LuLock size={16} /></span>
            </div>

            <div style={inputRow}>
              <input
                type="tel" placeholder="Phone (optional)"
                value={phone} onChange={e => setPhone(e.target.value)}
                style={inputStyle}
              />
              <span style={iconStyle}><LuPhone size={16} /></span>
            </div>

            {error && (
              <div style={{ color: '#c53030', fontSize: '0.82rem', marginBottom: '0.75rem' }}>
                {error}
              </div>
            )}

            {success && (
              <div style={{ color: '#276749', fontSize: '0.82rem', marginBottom: '0.75rem' }}>
                {success}
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.5rem' }}>
              <button
                type="button" onClick={() => { setStep(1); setError(''); }}
                style={{
                  background: 'none', border: 'none', padding: 0,
                  fontSize: '0.82rem', color: '#1a1a1a',
                  cursor: 'pointer',
                }}
              >
                Back
              </button>
              <button
                type="submit" disabled={loading}
                style={{
                  background: '#1a1a1a', color: '#fff', border: 'none',
                  borderRadius: '4px', padding: '0.5rem 1.5rem',
                  fontWeight: 600, fontSize: '0.875rem',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Footer */}
      <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
        <p style={{ color: '#999', fontSize: '0.72rem', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '4px' }}>
          Powered by
        </p>
        <p style={{ margin: 0, fontWeight: 700, fontSize: '1.1rem', letterSpacing: '1px' }}>
          <span style={{ color: '#555' }}>STRATO</span>
          <span style={{ color: '#c0392b' }}>POD</span>
        </p>
      </div>

    </div>
  );
};

export default Page;