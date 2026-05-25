'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LuTruck, LuMail, LuLock, LuUser, LuBuilding } from 'react-icons/lu';
import httpClient from '@/services/api';

interface Company { id: number; companyName: string; }

const Page = () => {
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [companyId, setCompanyId] = useState('');
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const apiBase = process.env.NEXT_PUBLIC_API_URL ?? '';
    fetch(`${apiBase}/api/companies`)
      .then(r => {
        if (!r.ok) throw new Error(`Server returned ${r.status}`);
        return r.json() as Promise<Company[]>;
      })
      .then(data => setCompanies(data))
      .catch(err => setError('Could not load companies: ' + (err instanceof Error ? err.message : 'Unknown error')));
  }, []);

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (!companyId) { setError('Please select a company.'); return; }
    if (form.password !== form.confirmPassword) { setError('Passwords do not match.'); return; }

    setLoading(true);
    try {
      const res = await httpClient.post<{ success: boolean; message: string }>('/api/auth/register', {
        firstName:       form.firstName,
        lastName:        form.lastName,
        username:        form.username,
        email:           form.email,
        password:        form.password,
        confirmPassword: form.confirmPassword,
        companyId:       Number(companyId),
      });

      if (!res.data.success) {
        setError(res.data.message);
        return;
      }

      router.push('/auth/sign-in');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputRow = (
    icon: React.ReactNode,
    type: string,
    placeholder: string,
    field: string,
    value: string
  ) => (
    <div style={{
      display: 'flex', alignItems: 'center',
      border: '1px solid #ddd', borderRadius: '4px',
      marginBottom: '1rem', overflow: 'hidden',
    }}>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={set(field)}
        required
        style={{
          flex: 1, border: 'none', outline: 'none',
          padding: '0.6rem 0.75rem', fontSize: '0.875rem', color: '#333',
        }}
      />
      <span style={{ padding: '0 0.75rem', color: '#aaa' }}>{icon}</span>
    </div>
  );

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
          Create your account
        </p>

        <form onSubmit={handleSubmit}>

          {/* Company dropdown */}
          <div style={{
            display: 'flex', alignItems: 'center',
            border: '1px solid #ddd', borderRadius: '4px',
            marginBottom: '1rem', overflow: 'hidden',
          }}>
            <select
              value={companyId}
              onChange={(e) => setCompanyId(e.target.value)}
              required
              style={{
                flex: 1, border: 'none', outline: 'none',
                padding: '0.6rem 0.75rem', fontSize: '0.875rem',
                color: companyId ? '#333' : '#aaa', background: '#fff',
              }}>
              <option value="">Select company...</option>
              {companies.map(c => (
                <option key={c.id} value={c.id}>{c.companyName}</option>
              ))}
            </select>
            <span style={{ padding: '0 0.75rem', color: '#aaa' }}><LuBuilding size={16} /></span>
          </div>

          {inputRow(<LuUser size={16} />, 'text', 'First name', 'firstName', form.firstName)}
          {inputRow(<LuUser size={16} />, 'text', 'Last name', 'lastName', form.lastName)}
          {inputRow(<LuUser size={16} />, 'text', 'Username', 'username', form.username)}
          {inputRow(<LuMail size={16} />, 'email', 'Email address', 'email', form.email)}
          {inputRow(<LuLock size={16} />, 'password', '••••••••', 'password', form.password)}
          {inputRow(<LuLock size={16} />, 'password', 'Confirm password', 'confirmPassword', form.confirmPassword)}

          {error && (
            <div style={{ color: '#c53030', fontSize: '0.82rem', marginBottom: '0.75rem' }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.5rem' }}>
            <Link href="/auth/sign-in" style={{ fontSize: '0.82rem', color: '#1a1a1a', textDecoration: 'none' }}>
              Already have an account?
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
              {loading ? 'Creating...' : 'Create Account'}
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
