'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { debounce } from '@/helpers/debounce';
import { toggleAttribute } from '@/helpers/layout';
import useViewPort from '@/hooks/useViewPort';

const STORAGE_KEY = '__SIMPLE_NEXT_CONFIG__';

const INIT_STATE = {
  skin: 'shadcn',
  monochrome: false,
  theme: 'light',
  sidenav: {
    size: 'default',
    color: 'light',
    user: true,
    isMobileMenuOpen: false
  },
  topBar: {
    color: 'light'
  },
  position: 'fixed'
};

function readFromStorage() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? { ...INIT_STATE, ...JSON.parse(raw) } : INIT_STATE;
  } catch {
    return INIT_STATE;
  }
}

const LayoutContext = createContext<any>(undefined);

const useLayoutContext = () => {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayoutContext can only be used within LayoutProvider');
  }
  return context;
};

const LayoutProvider = ({ children }: { children: React.ReactNode }) => {
  const [settings, setSettingsState] = useState(INIT_STATE);
  const [offcanvasStates, setOffcanvasStates] = useState({ showCustomizer: false });

  // Always-current ref — callbacks read from this so they never need settings in deps
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  // Hydrate from localStorage once on mount (avoids SSR mismatch)
  useEffect(() => {
    setSettingsState(readFromStorage());
  }, []);

  // updateSettings is stable: deps = [] effectively (setSettingsState is stable)
  const updateSettings = useCallback((patch: Partial<typeof INIT_STATE>) => {
    setSettingsState(prev => {
      const next = {
        ...prev,
        ...patch,
        sidenav: { ...prev.sidenav, ...((patch as any).sidenav || {}) },
        topBar:  { ...prev.topBar,  ...((patch as any).topBar  || {}) },
      };
      try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  // All callbacks are stable — they read settingsRef.current instead of closing over settings
  const changeSkin = useCallback((nSkin: string, persist = true) => {
    toggleAttribute('data-skin', nSkin);
    if (persist) updateSettings({ skin: nSkin } as any);
  }, [updateSettings]);

  const toggleMonochromeMode = useCallback((persist = true) => {
    const next = !settingsRef.current.monochrome;
    toggleAttribute('class', next ? 'monochrome' : '');
    if (persist) updateSettings({ monochrome: next } as any);
  }, [updateSettings]);

  const changeTheme = useCallback((nTheme: string, persist = true) => {
    toggleAttribute('data-bs-theme', nTheme);
    if (persist) updateSettings({ theme: nTheme } as any);
  }, [updateSettings]);

  const changeTopBarColor = useCallback((nColor: string, persist = true) => {
    toggleAttribute('data-topbar-color', nColor);
    if (persist) updateSettings({ topBar: { color: nColor } } as any);
  }, [updateSettings]);

  const changeSideNavSize = useCallback((nSize: string, persist = true) => {
    toggleAttribute('data-sidenav-size', nSize);
    if (persist) updateSettings({ sidenav: { ...settingsRef.current.sidenav, size: nSize } } as any);
  }, [updateSettings]);

  const changeSideNavColor = useCallback((nColor: string, persist = true) => {
    toggleAttribute('data-menu-color', nColor);
    if (persist) updateSettings({ sidenav: { ...settingsRef.current.sidenav, color: nColor } } as any);
  }, [updateSettings]);

  const toggleSideNavUser = useCallback(() => {
    const cur = settingsRef.current.sidenav;
    toggleAttribute('data-sidenav-user', (!cur.user).toString());
    updateSettings({ sidenav: { ...cur, user: !cur.user } } as any);
  }, [updateSettings]);

  const toggleMobileMenu = useCallback(() => {
    const cur = settingsRef.current.sidenav;
    updateSettings({ sidenav: { ...cur, isMobileMenuOpen: !cur.isMobileMenuOpen } } as any);
  }, [updateSettings]);

  const changePosition = useCallback((nPosition: string, persist = true) => {
    toggleAttribute('data-layout-position', nPosition);
    if (persist) updateSettings({ position: nPosition } as any);
  }, [updateSettings]);

  const toggleCustomizer = useCallback(() => {
    setOffcanvasStates(prev => ({ ...prev, showCustomizer: !prev.showCustomizer }));
  }, []);

  const customizer = useMemo(() => ({
    isOpen: offcanvasStates.showCustomizer,
    toggle: toggleCustomizer
  }), [offcanvasStates.showCustomizer, toggleCustomizer]);

  const reset = useCallback(() => {
    setSettingsState(INIT_STATE);
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(INIT_STATE)); } catch {}
  }, []);

  const hideBackdrop = useCallback(() => {
    const el = document.getElementById('custom-backdrop');
    if (el) {
      document.body.removeChild(el);
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }
  }, []);

  const showBackdrop = useCallback(() => {
    const el = document.createElement('div');
    el.id = 'custom-backdrop';
    el.className = 'offcanvas-backdrop fade show';
    document.body.appendChild(el);
    document.body.style.overflow = 'hidden';
    if (window.innerWidth > 767) document.body.style.paddingRight = '15px';
    el.addEventListener('click', () => {
      document.documentElement.classList.remove('sidebar-enable');
      const existing = document.getElementById('custom-backdrop');
      if (existing) {
        document.body.removeChild(existing);
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
      }
    });
  }, []);

  // Apply settings to DOM attributes whenever settings changes
  useEffect(() => {
    const s = settingsRef.current;
    toggleAttribute('data-skin',            s.skin);
    toggleAttribute('data-bs-theme',        s.theme);
    toggleAttribute('data-topbar-color',    s.topBar.color);
    toggleAttribute('data-sidenav-color',   s.sidenav.color);
    toggleAttribute('data-sidenav-size',    s.sidenav.size);
    toggleAttribute('data-sidenav-user',    s.sidenav.user.toString());
    toggleAttribute('data-layout-position', s.position);
    toggleAttribute('class',                s.monochrome ? 'monochrome' : '');
  }, [settings]);

  const { width } = useViewPort();

  // Sync sidenav size to viewport — skip when width=0 (SSR placeholder)
  useEffect(() => {
    if (width === 0) return;
    const targetSize  = width <= 1199 ? 'offcanvas' : 'default';
    const currentSize = document.documentElement.getAttribute('data-sidenav-size');
    if (currentSize !== targetSize) changeSideNavSize(targetSize);

    const debouncedResize = debounce(() => {
      const t = window.innerWidth <= 1199 ? 'offcanvas' : 'default';
      const c = document.documentElement.getAttribute('data-sidenav-size');
      if (c !== t) changeSideNavSize(t);
    }, 200);
    window.addEventListener('resize', debouncedResize);
    return () => window.removeEventListener('resize', debouncedResize);
  }, [width, changeSideNavSize]);

  const contextValue = useMemo(() => ({
    ...settings,
    changeSkin,
    toggleMonochromeMode,
    changeTheme,
    changeTopBarColor,
    changeSideNavSize,
    changeSideNavColor,
    toggleSideNavUser,
    toggleMobileMenu,
    changePosition,
    customizer,
    reset,
    showBackdrop,
    hideBackdrop,
  }), [
    settings,
    changeSkin,
    toggleMonochromeMode,
    changeTheme,
    changeTopBarColor,
    changeSideNavSize,
    changeSideNavColor,
    toggleSideNavUser,
    toggleMobileMenu,
    changePosition,
    customizer,
    reset,
    showBackdrop,
    hideBackdrop,
  ]);

  return (
    <LayoutContext.Provider value={contextValue}>
      {children}
    </LayoutContext.Provider>
  );
};

export { LayoutProvider, useLayoutContext };
