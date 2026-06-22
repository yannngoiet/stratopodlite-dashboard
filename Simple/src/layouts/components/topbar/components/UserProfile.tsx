'use client';

import { useLayoutContext } from '@/context/useLayoutContext';
import UserProfile from '@/layouts/components/topbar/components/UserProfile';
import Link from 'next/link';
import { Menu, Link as LinkIcon, Loader2 } from 'lucide-react';
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

  const handleConnect = async () => {
    if (!companyId) return;
    setConnecting(true);
    try {
      const url = await xeroService.getAuthorizeUrl(companyId);
      window.location.href = url;
    } finally {
      setConnecting(false);
    }
  };

  return (
    <header className="app-topbar" style={{ background: '#1a2340' }}>
      <div className="flex items-center justify-between w-full h-full px-5">

        {/* Left — brand + collapse toggle */}
        <div className="flex items-center gap-3">

          {/* Brand */}
          <Link href="/" className="flex items-center">
            <span className="font-bold text-lg tracking-widest text-white">STRATO</span>
            <span className="font-bold text-lg tracking-widest" style={{ color: '#00d4e8' }}>POD</span>
          </Link>

          {/* Collapse toggle */}
          <button
            onClick={toggleSideNav}
            className="button-collapse-toggle"
            style={{
              background: 'transparent',
              border: 'none',
              color: '#fff',
              padding: '0.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              opacity: 0.85,
            }}
          >
            <Menu size={20} />
          </button>
        </div>

        {/* Right — Connect Xero + User */}
        <div className="flex items-center gap-3">
          {isSuperAdmin && (
            <button
              onClick={handleConnect}
              disabled={connecting}
              className="flex items-center gap-2 text-white font-semibold text-sm px-4 py-2 transition-opacity hover:opacity-85 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ background: '#3b6fd4', border: 'none', borderRadius: 0 }}
            >
              {connecting
                ? <><Loader2 size={14} className="animate-spin" /> Connecting...</>
                : <><LinkIcon size={14} /> Connect Xero</>
              }
            </button>
          )}
          <UserProfile />
        </div>

      </div>
    </header>
  );
};

export default Topbar;