'use client';

import Link from 'next/link';
import user2 from '@/assets/images/users/user-2.jpg';
import Image from 'next/image';
import { useEffect, useState } from 'react';

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
        <Image src={user2.src} width={36} height={36} className="rounded-circle me-2 d-flex" alt="user-image" />
        <span>
          <h5 className="my-0 fw-semibold">{name || 'Loading...'}</h5>
          <h6 className="my-0 text-muted">{role || ''}</h6>
        </span>
      </Link>
    </div>
  );
};

export default UserProfile;