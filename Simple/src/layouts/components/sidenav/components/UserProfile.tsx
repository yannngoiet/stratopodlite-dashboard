'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

const getInitials = (fullName: string) =>
  fullName.trim().split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

const UserProfile = () => {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');

  useEffect(() => {
    const user = localStorage.getItem('user')
    if (user) {
      const parsed = JSON.parse(user)
      setName(`${parsed.firstName} ${parsed.lastName}`)
      setRole(parsed.role)
    }
  }, [])

  return (
    <div className="sidenav-user text-nowrap border border-dashed rounded-3">
      <Link href="" className="sidenav-user-name d-flex align-items-center">
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          background: 'linear-gradient(135deg, #2d5a27, #192319)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: 700, fontSize: '0.75rem',
          flexShrink: 0, marginRight: '0.5rem'
        }}>
          {name ? getInitials(name) : '?'}
        </div>
        <span>
          <h5 className="my-0 fw-semibold">{name || 'Loading...'}</h5>
          <h6 className="my-0 text-muted">{role || ''}</h6>
        </span>
      </Link>
    </div>
  );
};

export default UserProfile;