'use client';

import { useLayoutContext } from '@/context/useLayoutContext';
import UserProfile from '@/layouts/components/topbar/components/UserProfile';
import Link from 'next/link';
import { Container, Spinner } from 'react-bootstrap';
import { LuMenu, LuLink } from 'react-icons/lu';
import { appName } from '@/helpers';
import { useState, useEffect } from 'react';
import xeroService from '@/services/xeroService';

const Topbar = () => {
  const { changeSideNavSize, showBackdrop } = useLayoutContext();
  const [connecting,    setConnecting]    = useState(false);
  const [isSuperAdmin,  setIsSuperAdmin]  = useState(false);
  const [companyId,     setCompanyId]     = useState<number | null>(null);
  const [xeroConnected, setXeroConnected] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      const user = JSON.parse(stored);
      setIsSuperAdmin(user.role === 'SUPER_ADMIN');
      setCompanyId(user.companyId);

      // ── Check if Xero is already connected ───────────────────
      if (user.companyId) {
        xeroService.getStatus(user.companyId)
          .then(connected => setXeroConnected(connected))
          .catch(() => setXeroConnected(false));
      }
    }
  }, []);

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

  // ── Connect Xero ───────────────────────────────────────────────
  const handleConnect = async () => {
    if (!companyId) return;
    setConnecting(true);
    try {
      const url = await xeroService.getAuthorizeUrl(companyId);
      window.location.href = url;  // ← redirect same tab
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
          {isSuperAdmin && (
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
              {connecting ? 'Connecting...' : 'Connect Xero'}
            </button>
          )}
          <UserProfile />
        </div>
      </Container>
    </header>
  );
};

export default Topbar;