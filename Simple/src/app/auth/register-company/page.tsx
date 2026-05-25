'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LuTruck, LuBuilding } from 'react-icons/lu';

const COMPANY_TYPES = ['ORGANISATION', 'SUPPLIER', 'CUSTOMER', 'PARTNER'];

const Page = () => {
  const router = useRouter();
  const [companyName, setCompanyName] = useState('');
  const [companyType, setCompanyType] = useState('ORGANISATION');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!companyName.trim()) {
      setError('Company name is required.');
      return;
    }

    setLoading(true);
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL ?? '';
      const res = await fetch(`${apiBase}/api/companies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: companyName.trim(),
          companyType,
          isActive: true,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.message || `Failed to register company (${res.status}).`);
        return;
      }

      setSuccess('Company registered successfully!');
      setTimeout(() => router.push('/auth/sign-in'), 1500);
    } catch {
      setError('Could not reach the server. Please try again.');
    } finally {
      setLoading(false);
    }
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
        background: '#fff',
        borderRadius: '6px',
        padding: '2rem',
        width: '100%',
        maxWidth: '380px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
      }}>
        <p style={{ textAlign: 'center', color: '#888', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
          Register your company
        </p>

        <form onSubmit={handleSubmit}>

          {/* Company Name */}
          <div style={{
            display: 'flex', alignItems: 'center',
            border: '1px solid #ddd', borderRadius: '4px',
            marginBottom: '1rem', overflow: 'hidden',
          }}>
            <input
              type="text"
              placeholder="Company name"
              value={companyName}
              onChange={e => setCompanyName(e.target.value)}
              required
              style={{
                flex: 1, border: 'none', outline: 'none',
                padding: '0.6rem 0.75rem', fontSize: '0.875rem', color: '#333',
              }}
            />
            <span style={{ padding: '0 0.75rem', color: '#aaa' }}>
              <LuBuilding size={16} />
            </span>
          </div>

          {/* Company Type */}
          <div style={{
            display: 'flex', alignItems: 'center',
            border: '1px solid #ddd', borderRadius: '4px',
            marginBottom: '1rem', overflow: 'hidden',
          }}>
            <select
              value={companyType}
              onChange={e => setCompanyType(e.target.value)}
              style={{
                flex: 1, border: 'none', outline: 'none',
                padding: '0.6rem 0.75rem', fontSize: '0.875rem',
                color: '#333', background: '#fff',
              }}
            >
              {COMPANY_TYPES.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <span style={{ padding: '0 0.75rem', color: '#aaa' }}>
              <LuBuilding size={16} />
            </span>
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
            <Link href="/auth/sign-in" style={{ fontSize: '0.82rem', color: '#1a1a1a', textDecoration: 'none' }}>
              Back to Sign In
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
              {loading ? 'Saving...' : 'Save'}
            </button>
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
