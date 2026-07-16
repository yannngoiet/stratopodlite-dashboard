'use client';

import { useLayoutContext } from '@/context/useLayoutContext';
import { scrollToElement } from '@/helpers/layout';
import { menuItems, MenuItemType } from '@/layouts/components/data';
import deliveryNoteService from '@/services/deliveryNoteService';
import shipmentService from '@/services/shipmentService';
import driverService from '@/services/driverService';
import customerService from '@/services/customerService';
import vehicleService from '@/services/vehicleService';
import { getCompanyId } from '@/helpers/config';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { TbChevronDown } from 'react-icons/tb';

type DynamicBadges = Record<string, { text: string; variant: string }>

interface MenuItemWithChildrenProps {
  item: MenuItemType
  openMenuKey: string | null
  setOpenMenuKey: (key: string | null) => void
  level?: number
  dynamicBadges: DynamicBadges
}

interface MenuItemProps {
  item: MenuItemType
  dynamicBadges: DynamicBadges
}

const MenuItemWithChildren = ({
  item,
  openMenuKey,
  setOpenMenuKey,
  level = 0,
  dynamicBadges,
}: MenuItemWithChildrenProps) => {
  const pathname = usePathname();
  const isTopLevel = level === 0;
  const [localOpen, setLocalOpen] = useState(false);
  const [didAutoOpen, setDidAutoOpen] = useState(false);

  const isChildActive = (children: MenuItemType[]): boolean =>
    children.some(child =>
      (child.url && pathname.endsWith(child.url)) ||
      (child.children && isChildActive(child.children))
    );

  const isActive = isChildActive(item.children || []);
  const isOpen = isTopLevel ? openMenuKey === item.key : localOpen;

  useEffect(() => {
    if (isTopLevel && isActive && !didAutoOpen) {
      setOpenMenuKey(item.key);
      setDidAutoOpen(true);
    }
    if (!isTopLevel && isActive && !didAutoOpen) {
      setLocalOpen(true);
      setDidAutoOpen(true);
    }
  }, [isActive, isTopLevel, item.key, setOpenMenuKey, didAutoOpen]);

  const toggleOpen = () => {
    if (isTopLevel) {
      setOpenMenuKey(isOpen ? null : item.key);
    } else {
      setLocalOpen(prev => !prev);
    }
  };

  const badge = dynamicBadges[item.key] ?? item.badge;

  return <li className={`side-nav-item ${isOpen ? 'active' : ''}`}>
    <button onClick={toggleOpen} className="side-nav-link" aria-expanded={isOpen}>
      {item.icon && <span className="menu-icon"><item.icon /></span>}
      <span className="menu-text">{item.label}</span>
      {badge && <span className={`badge bg-${badge.variant}`}>{badge.text}</span>}
      <span className="menu-arrow"><TbChevronDown /></span>
    </button>
    <div style={{ display: isOpen ? 'block' : 'none' }}>
      <ul className="sub-menu">
        {(item.children || []).map(child =>
          child.children
            ? <MenuItemWithChildren key={child.key} item={child} openMenuKey={openMenuKey} setOpenMenuKey={setOpenMenuKey} level={level + 1} dynamicBadges={dynamicBadges} />
            : <MenuItem key={child.key} item={child} dynamicBadges={dynamicBadges} />
        )}
      </ul>
    </div>
  </li>;
};

const MenuItem = ({ item, dynamicBadges }: MenuItemProps) => {
  const pathname = usePathname();
  const isActive = item.url && pathname.endsWith(item.url);
  const { sidenav, hideBackdrop } = useLayoutContext();

  const toggleBackdrop = () => {
    if (sidenav.size === 'offcanvas') {
      hideBackdrop();
    }
  };

  const badge = dynamicBadges[item.key] ?? item.badge;

  return <li className={`side-nav-item ${isActive ? 'active' : ''}`}>
    <Link href={item.url ?? '/'} onClick={toggleBackdrop} className={`side-nav-link ${isActive ? 'active' : ''} ${item.isDisabled ? 'disabled' : ''}`}>
      {item.icon && <span className="menu-icon"><item.icon /></span>}
      <span className="menu-text">{item.label}</span>
      {badge && <span className={`badge text-bg-${badge.variant}`}>{badge.text}</span>}
    </Link>
  </li>;
};

const AppMenu = () => {
  const pathname = usePathname();
  const [openMenuKey, setOpenMenuKey] = useState<string | null>(null);
  const [dynamicBadges, setDynamicBadges] = useState<DynamicBadges>({});

  useEffect(() => {
    const set = (key: string, text: string) =>
      setDynamicBadges(prev => ({ ...prev, [key]: { text, variant: 'primary' } }))

    deliveryNoteService.getAll({ page: 1, pageSize: 1 })
      .then(r => set('delivery-notes', String(r.totalCount)))
      .catch(() => {})

    shipmentService.getAll({ page: 1, pageSize: 1 })
      .then(r => set('shipments', String(r.totalCount)))
      .catch(() => {})

    driverService.getAll()
      .then(r => set('drivers', String(r.length)))
      .catch(() => {})

    customerService.getAll({ page: 1, pageSize: 1 })
      .then(r => set('customers', String(r.totalCount)))
      .catch(() => {})

    vehicleService.getAll(getCompanyId())
      .then(r => set('vehicles', String(r.length)))
      .catch(() => {})
  }, [pathname]);

  const scrollToActiveLink = () => {
    const activeItem = document.querySelector('.side-nav-link.active') as HTMLElement;
    if (activeItem) {
      const simpleBarContent = document.querySelector('#sidenav .simplebar-content-wrapper') as HTMLElement;
      if (simpleBarContent) {
        const offset = activeItem.offsetTop - window.innerHeight * 0.4;
        scrollToElement(simpleBarContent, offset, 500);
      }
    }
  };

  useEffect(() => {
    setTimeout(() => scrollToActiveLink(), 100);
  }, []);

  return <ul className="side-nav">
    {menuItems.map(item =>
      item.isTitle
        ? <li className="side-nav-title mt-2" key={item.key}>{item.label}</li>
        : item.children
          ? <MenuItemWithChildren key={item.key} item={item} openMenuKey={openMenuKey} setOpenMenuKey={setOpenMenuKey} dynamicBadges={dynamicBadges} />
          : <MenuItem key={item.key} item={item} dynamicBadges={dynamicBadges} />
    )}
  </ul>;
};

export default AppMenu;
