'use client';

import { userDropdownItems } from '@/layouts/components/data';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Fragment, useEffect, useState } from 'react';
import { Dropdown, DropdownDivider, DropdownItem, DropdownMenu, DropdownToggle } from 'react-bootstrap';

const getInitials = (fullName: string) =>
  fullName.trim().split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

const UserProfile = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    router.push('/auth/sign-in');
  };

  useEffect(() => {
    const user = localStorage.getItem('user')
    if (user) {
      const parsed = JSON.parse(user)
      setEmail(parsed.email)
      setName(`${parsed.firstName} ${parsed.lastName}`)
    }
  }, [])

  return (
    <div className="topbar-item nav-user">
      <Dropdown align="end">
        <DropdownToggle as="a" className="topbar-link dropdown-toggle drop-arrow-none px-2 d-flex align-items-center gap-2" style={{ cursor: 'pointer', textDecoration: 'none' }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'linear-gradient(135deg, #2d5a27, #192319)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 700, fontSize: '0.72rem', flexShrink: 0
          }}>
            {name ? getInitials(name) : '?'}
          </div>
          <span style={{ color: '#333', fontWeight: 600, fontSize: '0.875rem', whiteSpace: 'nowrap' }}>{name || email}</span>
        </DropdownToggle>
        <DropdownMenu>
          {name && (
            <div className="dropdown-header noti-title">
              <h6 className="text-overflow m-0">{name}</h6>
            </div>
          )}
          {userDropdownItems.map((item, idx) => (
            <Fragment key={idx}>
              {item.isHeader ? (
                <div className="dropdown-header noti-title">
                  <h6 className="text-overflow m-0">{item.label}</h6>
                </div>
              ) : item.isDivider ? (
                <DropdownDivider />
              ) : item.isLogout ? (
                <DropdownItem as="button" className={item.class} onClick={handleLogout}>
                  {item.icon && <item.icon className="me-2 fs-17 align-middle" />}
                  <span className="align-middle">{item.label}</span>
                </DropdownItem>
              ) : (
                <DropdownItem as={Link} href={item.url ?? '#'} className={item.class}>
                  {item.icon && <item.icon className="me-2 fs-17 align-middle" />}
                  <span className="align-middle">{item.label}</span>
                </DropdownItem>
              )}
            </Fragment>
          ))}
        </DropdownMenu>
      </Dropdown>
    </div>
  );
};

export default UserProfile;