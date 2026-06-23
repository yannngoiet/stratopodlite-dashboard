'use client';

import { Fragment, useEffect, useState } from 'react';
import Loader from '@/components/Loader';
import Sidenav from '@/layouts/components/sidenav';
import Topbar from '@/layouts/components/topbar';
import Footer from '@/layouts/components/footer';

const VerticalLayout = ({ children }) => {
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => {
    setHasMounted(true);
  }, []);
  if (!hasMounted) return <Loader height="100vh" />;
  return (
    <Fragment>
      <div className="wrapper">
        <Sidenav />
        <Topbar />
        <div className="content-page">
          {children}
          <Footer />
        </div>
      </div>
    </Fragment>
  );
};
export default VerticalLayout;
