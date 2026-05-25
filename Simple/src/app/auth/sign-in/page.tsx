'use client';

import { useState } from 'react';
import Link from 'next/link';
import { LuTruck, LuUser, LuLock, LuBuilding2 } from 'react-icons/lu';
import { useAuth } from '@/hooks/useAuth';

const Page = () => {
  const { login, error, loading } = useAuth();
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password,        setPassword]        = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await login(usernameOrEmail, password);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#e8eae8',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem',
    }}>

      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <div style={{
          width: 80, height: 80,
          background: '#1a1a1a',
          borderRadius: '50%',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '0.75rem',
          boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
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
        <p style={{ textAlign: 'center', color: '#888', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
          Sign in to start your session
        </p>

        <form onSubmit={handleSubmit}>

          {/* Username or Email */}
          <div style={{
            display: 'flex', alignItems: 'center',
            border: '1px solid #ddd', borderRadius: '4px',
            marginBottom: '1rem', overflow: 'hidden',
          }}>
            <input
              type="text"
              placeholder="Username or email"
              value={usernameOrEmail}
              onChange={e => setUsernameOrEmail(e.target.value)}
              required
              style={{
                flex: 1, border: 'none', outline: 'none',
                padding: '0.6rem 0.75rem', fontSize: '0.875rem', color: '#333',
              }}
            />
            <span style={{ padding: '0 0.75rem', color: '#aaa' }}>
              <LuUser size={16} />
            </span>
          </div>

          {/* Password */}
          <div style={{
            display: 'flex', alignItems: 'center',
            border: '1px solid #ddd', borderRadius: '4px',
            marginBottom: '1rem', overflow: 'hidden',
          }}>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={{
                flex: 1, border: 'none', outline: 'none',
                padding: '0.6rem 0.75rem', fontSize: '0.875rem', color: '#333',
              }}
            />
            <span style={{ padding: '0 0.75rem', color: '#aaa' }}>
              <LuLock size={16} />
            </span>
          </div>

          {error && (
            <div style={{ color: '#c53030', fontSize: '0.82rem', marginBottom: '0.75rem' }}>
              {error}
            </div>
          )}

          {/* Forgot + Sign In */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Link href="/auth/reset-password" style={{ fontSize: '0.82rem', color: '#1a1a1a', textDecoration: 'none' }}>
              I forgot my password
            </Link>
            <button
              type="submit"
              disabled={loading}
              style={{
                background: '#1a1a1a', color: '#fff',
                border: 'none', borderRadius: '4px',
                padding: '0.5rem 1.5rem',
                fontWeight: 600, fontSize: '0.875rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </div>

          {/* Register new company */}
          <div style={{ marginTop: '1rem', borderTop: '1px solid #eee', paddingTop: '1rem' }}>
            <Link href="/auth/register-company" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
              border: '1px solid #ddd', borderRadius: '4px',
              padding: '0.45rem 1rem',
              fontSize: '0.82rem', color: '#555', fontWeight: 500,
              textDecoration: 'none', background: '#fafafa',
            }}>
              <LuBuilding2 size={14} />
              Register a new company
            </Link>
          </div>

        </form>
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