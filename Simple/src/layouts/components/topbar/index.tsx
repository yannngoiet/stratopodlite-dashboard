'use client';

import { useLayoutContext } from '@/context/useLayoutContext';
import UserProfile from '@/layouts/components/topbar/components/UserProfile';
import Link from 'next/link';
import { Container } from 'react-bootstrap';
import { LuMenu } from 'react-icons/lu';
import { appName } from '@/helpers';

const Topbar = () => {
  const { changeSideNavSize, showBackdrop } = useLayoutContext();

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
          <UserProfile />
        </div>
      </Container>
    </header>
  );
};

export default Topbar;