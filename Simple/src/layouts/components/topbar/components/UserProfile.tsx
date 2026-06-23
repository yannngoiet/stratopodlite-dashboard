'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { User, LogOut, ChevronDown } from 'lucide-react';
import authService from '@/services/authService';

interface StoredUser {
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: string;
}

const UserProfile = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<StoredUser | null>(null);
  const [signOutHovered, setSignOutHovered] = useState(false);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch {}
    }
  }, []);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const logout = () => {
    authService.logout();
    router.push('/auth/sign-in');
  };

  const displayName = user
    ? [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email || 'User'
    : 'User';

  const initials = displayName
    .split(' ')
    .slice(0, 2)
    .map((n: string) => n[0])
    .join('')
    .toUpperCase();

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(prev => !prev)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: 'transparent',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: '0.375rem',
          padding: '0.375rem 0.75rem',
          color: '#fff',
          cursor: 'pointer',
          fontSize: '0.875rem',
        }}
      >
        <div style={{
          width: '1.75rem',
          height: '1.75rem',
          borderRadius: '50%',
          background: '#29b6c5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.7rem',
          fontWeight: 700,
          color: '#fff',
        }}>
          {initials || <User size={12} />}
        </div>
        <span style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {displayName}
        </span>
        <ChevronDown size={14} style={{ opacity: 0.7, flexShrink: 0 }} />
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          right: 0,
          top: 'calc(100% + 0.5rem)',
          background: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: '0.5rem',
          boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
          minWidth: '180px',
          zIndex: 1050,
        }}>
          <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #f3f4f6' }}>
            <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem', color: '#1a2340' }}>
              {displayName}
            </p>
            {user?.role && (
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#6b7a99', marginTop: '0.125rem' }}>
                {user.role}
              </p>
            )}
          </div>
          <button
            onClick={logout}
            onMouseEnter={() => setSignOutHovered(true)}
            onMouseLeave={() => setSignOutHovered(false)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.625rem 1rem',
              background: signOutHovered ? '#fef2f2' : 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.875rem',
              color: '#dc2626',
              textAlign: 'left',
              transition: 'background 0.15s ease',
            }}
          >
            <LogOut size={14} />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
