'use client';

import { userDropdownItems } from '@/layouts/components/data';
import Image from 'next/image';
import Link from 'next/link';
import { Fragment, useEffect, useState } from 'react';
import { Dropdown, DropdownDivider, DropdownItem, DropdownMenu, DropdownToggle } from 'react-bootstrap';
import user2 from '@/assets/images/users/user-2.jpg';

const UserProfile = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');

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
        <DropdownToggle as="a" className="topbar-link dropdown-toggle drop-arrow-none px-2 d-flex align-items-center gap-2">
          <Image src={user2.src} width={32} height={32} className="rounded-circle" alt="user-image" />
          <span className="d-none d-md-block text-white">{email}</span>
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