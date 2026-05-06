'use client';

import SimplebarClient from '@/components/client-wrapper/SimplebarClient';
import { useLayoutContext } from '@/context/useLayoutContext';
import AppMenu from '@/layouts/components/sidenav/components/AppMenu';
import UserProfile from '@/layouts/components/sidenav/components/UserProfile';
import { LuSquareChevronLeft } from 'react-icons/lu';
const Sidenav = () => {
  const {
    sidenav,
    changeSideNavSize
  } = useLayoutContext();
  const handleCollapse = () => {
    if (sidenav.size === 'default') {
      changeSideNavSize('collapse');
      return;
    }
    changeSideNavSize('default');
  };
  return <div className="sidenav-menu">
      <SimplebarClient id="sidenav" className="scrollbar">
        <UserProfile />
        <AppMenu />
      </SimplebarClient>

      <div className="menu-collapse-box d-none d-xl-block">
        <button className="button-collapse-toggle" onClick={handleCollapse}>
          <LuSquareChevronLeft className="align-middle flex-shrink-0" />
          <span>Collapse Menu</span>
        </button>
      </div>
    </div>;
};
export default Sidenav;