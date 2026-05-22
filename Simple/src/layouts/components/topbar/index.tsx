'use client';

import { useLayoutContext } from '@/context/useLayoutContext';
import UserProfile from '@/layouts/components/topbar/components/UserProfile';
import Link from 'next/link';
import { Container, Spinner } from 'react-bootstrap';
import { LuMenu, LuLink } from 'react-icons/lu';
import { appName } from '@/helpers';
import { useState } from 'react';
import xeroService from '@/services/xeroService';

const Topbar = () => {
  const { changeSideNavSize, showBackdrop } = useLayoutContext();
  const [connecting, setConnecting] = useState(false);

  const toggleSideNav = () => {
    const html = document.documentElement;
    const currentSize = html.getAttribute('data-sidenav-size');
    if (currentSize === 'offcanvas') {
      html.classList.toggle('sidebar-enable');
      showBackdrop();
    } else {
      changeSideNavSize(currentSize === 'collapse' ? 'default' : 'collapse');
    }
  };

  const handleConnect = async () => {
    setConnecting(true);
    try {
      const url = await xeroService.getAuthorizeUrl();
      window.open(url, '_blank');
    } finally {
      setConnecting(false);
    }
  };

  return (
    <header className="app-topbar">
      <Container fluid className="topbar-menu">
        <div className="d-flex align-items-center gap-2">
          <div className="logo-topbar">
            <Link href="/" className="logo-dark">
              <span className="logo-text text-white fw-bold fs-xl">{appName}</span>
            </Link>
            <Link href="/" className="logo-light">
              <span className="logo-text text-white fw-bold fs-xl">{appName}</span>
            </Link>
          </div>
          <button onClick={toggleSideNav} className="button-collapse-toggle">
            <LuMenu className="fs-22 align-middle" />
          </button>
        </div>

        <div className="d-flex align-items-center gap-2">
          <button
            onClick={handleConnect}
            disabled={connecting}
            style={{
              background: '#13B5EA',
              border: 'none',
              borderRadius: '8px',
              padding: '0.45rem 1.1rem',
              fontWeight: 600,
              fontSize: '0.85rem',
              color: '#fff',
              cursor: connecting ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            {connecting ? <Spinner size="sm" /> : <LuLink size={15} />}
            {connecting ? 'Connecting...' : 'Connect'}
          </button>
          <UserProfile />
        </div>
      </Container>
    </header>
  );
};

export default Topbar;