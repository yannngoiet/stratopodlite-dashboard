'use client';

import { useState } from 'react';
import Link from 'next/link';
import { LuTruck, LuUser, LuLock, LuBuilding2 } from 'react-icons/lu';
import { useAuth } from '@/hooks/useAuth';
import { notify } from '@/lib/toast';

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
    <div className="auth-page">

      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div className="auth-logo-circle">
          <LuTruck size={36} color="#fff" />
        </div>
        <p className="auth-logo-text">
          STRATO<span className="auth-logo-accent">POD</span>
        </p>
        <p className="auth-logo-sub">Electronic Proof of Delivery</p>
      </div>

      {/* Card */}
      <div className="auth-card">

        <div className="auth-card-heading">
          <h2 className="auth-card-title">Sign in</h2>
          <p className="auth-card-sub">Welcome back — enter your details below</p>
        </div>

        <form onSubmit={handleSubmit}>

          {/* Username or Email */}
          <div style={{ marginBottom: '1rem' }}>
            <label className="field-label">Username or email</label>
            <div className={`input-wrapper${error ? ' has-error' : ''}`}>
              <LuUser size={16} className="dash-text-muted" />
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
              <LuLock size={16} className="dash-text-muted" />
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

          {error && (
            <p className="field-error" style={{ marginBottom: '1rem' }}>{error}</p>
          )}

          <div className="auth-footer-row">
            <Link href="/auth/reset-password" className="auth-link">
              Forgot password?
            </Link>
            <button type="submit" disabled={loading} className="btn-blue" style={{ borderRadius: 0 }}>
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>

          <div className="auth-divider">
            <Link href="/auth/register-company" className="auth-register-link">
              <LuBuilding2 size={15} className="dash-text-blue" />
              Register a new company
            </Link>
          </div>

        </form>
      </div>

      <p className="auth-footer">
        &copy; {new Date().getFullYear()} StratoPOD. All rights reserved.
      </p>

    </div>
  );
}
