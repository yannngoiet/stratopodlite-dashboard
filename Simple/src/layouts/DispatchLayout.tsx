'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import {
  LuActivity,
  LuBell,
  LuChevronRight,
  LuClipboardList,
  LuFileText,
  LuLayoutDashboard,
  LuLogOut,
  LuMenu,
  LuMonitor,
  LuPackage,
  LuScroll,
  LuSettings,
  LuShoppingCart,
  LuTruck,
  LuX,
} from 'react-icons/lu'
import SimplebarClient from '@/components/client-wrapper/SimplebarClient'
import { ElementType, ReactNode } from 'react'

interface MenuItem {
  key: string
  label: string
  icon: ElementType
  url: string
  disabled?: boolean
  badge?: string
  hasChildren?: boolean
}

interface DispatchLayoutProps {
  children: ReactNode
  companyName?: string
}

const DISPATCH_MENU: MenuItem[] = [
  { key: 'dashboard', label: 'Dashboard', icon: LuLayoutDashboard, url: '/dashboard' },
  { key: 'dispatch-hub', label: 'Dispatch Hub', icon: LuTruck, url: '/dispatch-hub' },
  { key: 'cancellation', label: 'Cancellation', icon: LuX, url: '#', disabled: true },
  { key: 'loads', label: 'Loads', icon: LuPackage, url: '#', disabled: true },
  { key: 'proof-of-deliveries', label: 'Proof of Deliveries', icon: LuFileText, url: '#', hasChildren: true, disabled: true },
  { key: 'proof-of-collection', label: 'Proof of Collection', icon: LuClipboardList, url: '#', hasChildren: true, disabled: true },
  { key: 'orders', label: 'Orders', icon: LuShoppingCart, url: '#', disabled: true },
  { key: 'trip-sheets', label: 'Trip Sheets', icon: LuScroll, url: '#', disabled: true },
  { key: 'truck-maintenance', label: 'Truck Maintenance', icon: LuTruck, url: '#', badge: '0', disabled: true },
  { key: 'reports', label: 'Reports', icon: LuFileText, url: '#', hasChildren: true, disabled: true },
  { key: 'devices', label: 'Devices', icon: LuMonitor, url: '#', disabled: true },
  { key: 'configuration', label: 'Configuration', icon: LuSettings, url: '#', hasChildren: true, disabled: true },
  { key: 'system-health', label: 'System Health', icon: LuActivity, url: '#', hasChildren: true, disabled: true },
]

const SIDEBAR_WIDTH = 240

const DispatchLayout = ({ children, companyName = 'STRATO' }: DispatchLayoutProps) => {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1050, display: 'flex', flexDirection: 'column', background: '#f4f6f9' }}>
      {/* ── Topbar ── */}
      <header
        style={{
          height: 56,
          background: '#fff',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          padding: '0 20px',
          gap: 14,
          flexShrink: 0,
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        }}>
        <button
          onClick={() => setSidebarOpen((v) => !v)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#555', display: 'flex', alignItems: 'center' }}>
          <LuMenu size={20} />
        </button>

        <div>
          <div style={{ fontWeight: 700, fontSize: 15, lineHeight: 1.1, color: '#111' }}>{companyName}</div>
          <div style={{ fontSize: 11, color: '#888', lineHeight: 1 }}>Dispatch Hub</div>
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 12, color: '#666' }}>Welcome to StratoPOD at {companyName}</span>
          <button className="btn btn-sm" style={{ background: '#dc3545', color: '#fff', fontSize: 12, border: 'none' }}>
            Connect to Xero
          </button>
          <button
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#555',
              display: 'flex',
              alignItems: 'center',
              padding: 6,
              borderRadius: 6,
              position: 'relative',
            }}>
            <LuBell size={18} />
            <span style={{ position: 'absolute', top: 2, right: 2, width: 8, height: 8, background: '#dc3545', borderRadius: '50%' }} />
          </button>
          <Link
            href="/dashboard"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 13,
              color: '#333',
              textDecoration: 'none',
              padding: '4px 10px',
              border: '1px solid #ddd',
              borderRadius: 6,
            }}>
            <LuLogOut size={14} />
            Log Out
          </Link>
        </div>
      </header>

      {/* ── Body ── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* ── Sidebar ── */}
        <div
          style={{
            width: sidebarOpen ? SIDEBAR_WIDTH : 0,
            minWidth: sidebarOpen ? SIDEBAR_WIDTH : 0,
            background: '#fff',
            borderRight: '1px solid #e5e7eb',
            display: 'flex',
            flexDirection: 'column',
            flexShrink: 0,
            overflow: 'hidden',
            transition: 'width 0.2s ease, min-width 0.2s ease',
          }}>
          <div style={{ background: '#dc3545', padding: '14px 18px', flexShrink: 0 }}>
            <div style={{ fontWeight: 800, fontSize: 17, color: '#fff', letterSpacing: 0.5 }}>{companyName}</div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.75)', letterSpacing: 1.5, marginTop: 1 }}>DELIVERY MANAGEMENT</div>
          </div>

          <div style={{ padding: '10px 14px', borderBottom: '1px solid #f0f0f0', flexShrink: 0 }}>
            <div style={{ fontWeight: 600, fontSize: 13, color: '#111' }}>Shardar Sha</div>
            <div style={{ fontSize: 11, color: '#888' }}>Administrator ▾</div>
          </div>

          <SimplebarClient style={{ flex: 1 }}>
            <ul style={{ listStyle: 'none', margin: 0, padding: '6px 0' }}>
              {DISPATCH_MENU.map((item) => {
                const isActive = pathname === item.url
                const Icon = item.icon
                const linkStyle: React.CSSProperties = {
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '9px 16px',
                  fontSize: 13,
                  textDecoration: 'none',
                  color: isActive ? '#dc3545' : '#444',
                  background: isActive ? '#fff5f5' : 'transparent',
                  fontWeight: isActive ? 600 : 400,
                  borderLeft: `3px solid ${isActive ? '#dc3545' : 'transparent'}`,
                  whiteSpace: 'nowrap',
                  cursor: item.disabled ? 'default' : 'pointer',
                }
                return (
                  <li key={item.key}>
                    {item.disabled ? (
                      <span style={linkStyle} onClick={(e) => e.preventDefault()}>
                        <Icon size={15} style={{ flexShrink: 0 }} />
                        <span style={{ flex: 1 }}>{item.label}</span>
                        {item.badge !== undefined && (
                          <span style={{ background: '#e9ecef', borderRadius: 10, padding: '1px 8px', fontSize: 10, color: '#555' }}>
                            {item.badge}
                          </span>
                        )}
                        {item.hasChildren && <LuChevronRight size={13} style={{ color: '#aaa', flexShrink: 0 }} />}
                      </span>
                    ) : (
                      <Link href={item.url} style={linkStyle}>
                        <Icon size={15} style={{ flexShrink: 0 }} />
                        <span style={{ flex: 1 }}>{item.label}</span>
                        {item.badge !== undefined && (
                          <span style={{ background: '#e9ecef', borderRadius: 10, padding: '1px 8px', fontSize: 10, color: '#555' }}>
                            {item.badge}
                          </span>
                        )}
                        {item.hasChildren && <LuChevronRight size={13} style={{ color: '#aaa', flexShrink: 0 }} />}
                      </Link>
                    )}
                  </li>
                )
              })}
            </ul>
          </SimplebarClient>
        </div>

        {/* ── Main content ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>{children}</div>
      </div>
    </div>
  )
}

export default DispatchLayout
