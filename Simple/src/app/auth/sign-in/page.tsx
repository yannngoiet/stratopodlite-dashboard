'use client';

import { useState } from 'react';
import { Button, Form, FormControl, InputGroup, Spinner } from 'react-bootstrap';
import Link from 'next/link';
import { LuMail, LuLock, LuTruck } from 'react-icons/lu';
import { useAuth } from '@/hooks/useAuth';

const Page = () => {
  const { login, error, loading } = useAuth();
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await login(usernameOrEmail, password);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
    }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>

        {/* Brand */}
        <div className="text-center mb-4">
          <div style={{
            width: 64, height: 64,
            background: 'linear-gradient(135deg, #e94560, #0f3460)',
            borderRadius: '16px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem',
            boxShadow: '0 8px 24px rgba(233,69,96,0.35)',
          }}>
            <LuTruck size={32} color="#fff" />
          </div>
          <h3 style={{ color: '#fff', fontWeight: 700, marginBottom: '4px', letterSpacing: '-0.5px' }}>
            STRATOPOD
          </h3>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.85rem', margin: 0 }}>
            Electronic Proof of Delivery
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: '#fff',
          borderRadius: '20px',
          padding: '2rem',
          boxShadow: '0 24px 64px rgba(0,0,0,0.35)',
        }}>
          <h5 style={{ fontWeight: 600, marginBottom: '4px', color: '#1a1a2e' }}>
            Sign in to your account
          </h5>
          <p style={{ color: '#8898aa', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
            Enter your credentials to continue
          </p>

          <Form onSubmit={handleSubmit}>
            {/* Username / Email */}
            <Form.Group className="mb-3">
              <Form.Label style={{ fontWeight: 500, fontSize: '0.85rem', color: '#344050' }}>
                Username or Email
              </Form.Label>
              <InputGroup>
                <InputGroup.Text style={{ background: '#f4f6fa', border: '1.5px solid #e2e8f0', borderRight: 'none', borderRadius: '10px 0 0 10px' }}>
                  <LuMail size={16} color="#8898aa" />
                </InputGroup.Text>
                <FormControl
                  type="text"
                  placeholder="admin or you@example.com"
                  value={usernameOrEmail}
                  onChange={(e) => setUsernameOrEmail(e.target.value)}
                  required
                  style={{
                    border: '1.5px solid #e2e8f0',
                    borderLeft: 'none',
                    borderRadius: '0 10px 10px 0',
                    background: '#f4f6fa',
                    fontSize: '0.9rem',
                    padding: '0.6rem 0.9rem',
                  }}
                />
              </InputGroup>
            </Form.Group>

            {/* Password */}
            <Form.Group className="mb-2">
              <Form.Label style={{ fontWeight: 500, fontSize: '0.85rem', color: '#344050' }}>
                Password
              </Form.Label>
              <InputGroup>
                <InputGroup.Text style={{ background: '#f4f6fa', border: '1.5px solid #e2e8f0', borderRight: 'none', borderRadius: '10px 0 0 10px' }}>
                  <LuLock size={16} color="#8898aa" />
                </InputGroup.Text>
                <FormControl
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{
                    border: '1.5px solid #e2e8f0',
                    borderLeft: 'none',
                    borderRadius: '0 10px 10px 0',
                    background: '#f4f6fa',
                    fontSize: '0.9rem',
                    padding: '0.6rem 0.9rem',
                  }}
                />
              </InputGroup>
            </Form.Group>

            {/* Forgot */}
            <div className="text-end mb-3">
              <Link href="/auth/reset-password" style={{ fontSize: '0.82rem', color: '#e94560', textDecoration: 'none', fontWeight: 500 }}>
                Forgot password?
              </Link>
            </div>

            {/* Error */}
            {error && (
              <div style={{
                background: '#fff5f5',
                border: '1px solid #fed7d7',
                borderRadius: '10px',
                padding: '0.65rem 1rem',
                color: '#c53030',
                fontSize: '0.85rem',
                marginBottom: '1rem',
              }}>
                {error}
              </div>
            )}

            {/* Submit */}
            <Button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #1a1a2e, #0f3460)',
                border: 'none',
                borderRadius: '10px',
                padding: '0.7rem',
                fontWeight: 600,
                fontSize: '0.95rem',
                letterSpacing: '0.3px',
                boxShadow: '0 4px 16px rgba(15,52,96,0.35)',
              }}
            >
              {loading ? <><Spinner size="sm" className="me-2" />Signing in...</> : 'Sign In'}
            </Button>
          </Form>
        </div>

        {/* Footer */}
        <p className="text-center mt-4" style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>
          Powered by <span style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>STRATOPOD</span>
          &nbsp;© {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
};

export default Page;
