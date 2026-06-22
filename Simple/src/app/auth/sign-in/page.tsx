'use client';

import { useState } from 'react';
import Link from 'next/link';
import { LuTruck, LuUser, LuLock, LuBuilding2 } from 'react-icons/lu';
import { useAuth } from '@/hooks/useAuth';
import { notify } from '@/lib/toast';

const C = {
  primary: '#3b6fd4',
  teal:    '#29b6c5',
  bg:      '#f0f2f5',
  card:    '#ffffff',
  text:    '#1a2340',
  muted:   '#6b7a99',
  border:  '#dde3f0',
};

export default function SignInPage() {
  const { login, error, loading } = useAuth();
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await login(usernameOrEmail, password);
    } catch (err: any) {
      notify.error('Sign in failed', err?.message ?? 'Invalid credentials');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>

      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{ width: 76, height: 76, background: C.primary, borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
          <LuTruck size={36} color="#fff" />
        </div>
        <p style={{ margin: 0, fontWeight: 700, fontSize: '1.3rem', letterSpacing: '1px', color: C.text }}>
          STRATO<span style={{ color: C.teal }}>POD</span>
        </p>
        <p style={{ margin: '4px 0 0', fontSize: '0.72rem', fontWeight: 500, color: C.muted, letterSpacing: '2px', textTransform: 'uppercase' }}>
          Electronic Proof of Delivery
        </p>
      </div>

      {/* Card */}
      <div style={{ background: C.card, borderRadius: '12px', padding: '2rem', width: '100%', maxWidth: '400px', boxShadow: '0 4px 24px rgba(59,111,212,0.1)' }}>

        {/* Card header */}
        <div style={{ borderBottom: `3px solid ${C.primary}`, paddingBottom: '1rem', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: C.text }}>Sign in</h2>
          <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: C.muted }}>Welcome back — enter your details below</p>
        </div>

        <form onSubmit={handleSubmit}>

          {/* Username or Email */}
          <div style={{ marginBottom: '1rem' }}>
            <label className="field-label">Username or email</label>
            <div className={`input-wrapper${error ? ' has-error' : ''}`}>
              <LuUser size={16} color={C.muted} />
              <input
                className="raw-input"
                type="text"
                placeholder="you@company.co.za"
                value={usernameOrEmail}
                onChange={e => setUsernameOrEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Password */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label className="field-label">Password</label>
            <div className={`input-wrapper${error ? ' has-error' : ''}`}>
              <LuLock size={16} color={C.muted} />
              <input
                className="raw-input"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Inline error */}
          {error && (
            <p className="field-error" style={{ marginBottom: '1rem' }}>{error}</p>
          )}

          {/* Forgot + Submit */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <Link href="/auth/reset-password" style={{ fontSize: '0.8rem', color: C.primary, textDecoration: 'none', fontWeight: 500 }}>
              Forgot password?
            </Link>
            <button
              type="submit"
              disabled={loading}
              style={{ background: C.primary, color: '#fff', border: 'none', padding: '0.55rem 1.5rem', fontWeight: 600, fontSize: '0.875rem' }}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>

          {/* Register */}
          <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: '1.25rem' }}>
            <Link href="/auth/register-company" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              border: `1.5px solid ${C.border}`,
              padding: '0.55rem 1rem', fontSize: '0.82rem', color: C.text,
              fontWeight: 500, textDecoration: 'none', background: '#f8f9fc',
            }}>
              <LuBuilding2 size={15} color={C.primary} />
              Register a new company
            </Link>
          </div>

        </form>
      </div>

      {/* Footer */}
      <p style={{ marginTop: '1.5rem', fontSize: '0.72rem', color: C.muted }}>
        &copy; {new Date().getFullYear()} StratoPOD. All rights reserved.
      </p>

    </div>
  );
}