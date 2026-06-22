'use client';

import { useEffect, useState } from 'react';
import { Package, Users, Truck, Car, Activity, TriangleAlert, Check, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import dashboardStatsService, { type DashboardStats } from '@/services/dashboardStatsService';
import DeliveryStatistics from './components/DeliveryStatistics';
import StatusBreakdownCard from './components/StatusBreakdownCard';
import RecentDeliveryNotes from './components/RecentDeliveryNotes';

const empty: DashboardStats = {
  totalDeliveryNotes:  0,
  totalCustomers:      0,
  totalDrivers:        0,
  totalVehicles:       0,
  deliveriesByStatus:  [],
  recentDeliveryNotes: [],
};

const STAT_CARDS = (stats: DashboardStats) => [
  { label: 'Delivery Notes', value: stats.totalDeliveryNotes, sub: 'total in system',    icon: Package, accent: '#3b6fd4', softBg: '#f0f5ff' },
  { label: 'Customers',      value: stats.totalCustomers,     sub: 'active customers',   icon: Users,   accent: '#29b6c5', softBg: '#f0fbfc' },
  { label: 'Drivers',        value: stats.totalDrivers,       sub: 'registered drivers', icon: Truck,   accent: '#3b6fd4', softBg: '#f0f5ff' },
  { label: 'Vehicles',       value: stats.totalVehicles,      sub: 'fleet size',         icon: Car,     accent: '#29b6c5', softBg: '#f0fbfc' },
];

export default function DashboardPage() {
  const [stats, setStats]                               = useState<DashboardStats>(empty);
  const [error, setError]                               = useState<string | null>(null);
  const [xeroSuccess, setXeroSuccess]                   = useState(false);
  const [xeroAlreadyConnected, setXeroAlreadyConnected] = useState(false);
  const [companyName, setCompanyName]                   = useState('STRATOPOD');
  const [companyType, setCompanyType]                   = useState('');

  useEffect(() => {
    const params    = new URLSearchParams(window.location.search);
    const xeroParam = params.get('xero');
    if (xeroParam === 'connected') {
      const channel = new BroadcastChannel('xero_callback');
      channel.postMessage({ connected: true });
      channel.close();
      if (window.opener) { window.close(); }
      else { setXeroSuccess(true); window.history.replaceState({}, '', '/dashboard'); }
    } else if (xeroParam === 'already_connected') {
      setXeroAlreadyConnected(true);
      window.history.replaceState({}, '', '/dashboard');
    }
  }, []);

  useEffect(() => {
    const channel = new BroadcastChannel('xero_callback');
    channel.onmessage = () => setXeroSuccess(true);
    return () => channel.close();
  }, []);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'xero_callback' && e.newValue) {
        setXeroSuccess(true);
        localStorage.removeItem('xero_callback');
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  useEffect(() => {
    dashboardStatsService
      .getStats()
      .then(setStats)
      .catch(() => setError('Dashboard API is not running — showing empty data.'));
  }, []);

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      const parsed = JSON.parse(user);
      if (parsed.companyName) setCompanyName(parsed.companyName);
      if (parsed.companyType) setCompanyType(parsed.companyType);
    }
  }, []);

  return (
    <div id="dashboard-root" style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

      {/* ── Banners ── */}
      {xeroSuccess && (
        <Alert className="border-emerald-200 bg-emerald-50 text-emerald-800 flex items-center justify-between rounded-none">
          <div className="flex items-center gap-2">
            <Check size={15} />
            <AlertDescription className="font-semibold">Xero connected successfully!</AlertDescription>
          </div>
          <button className="btn-ghost" style={{ color: '#1a7a4a' }} onClick={() => setXeroSuccess(false)}>
            <X size={15} />
          </button>
        </Alert>
      )}

      {xeroAlreadyConnected && (
        <Alert className="border-blue-200 bg-blue-50 text-blue-800 flex items-center justify-between rounded-none">
          <div className="flex items-center gap-2">
            <Check size={15} />
            <AlertDescription className="font-semibold">This Xero organisation is already connected.</AlertDescription>
          </div>
          <button className="btn-ghost" style={{ color: '#3b6fd4' }} onClick={() => setXeroAlreadyConnected(false)}>
            <X size={15} />
          </button>
        </Alert>
      )}

      {error && (
        <Alert className="border-amber-200 bg-amber-50 text-amber-800 rounded-none flex items-center gap-2">
          <TriangleAlert size={15} />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* ── Page header ── */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
          <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#1a2340' }}>{companyName}</h1>
          {companyType && (
            <Badge variant="outline" className="text-[#6b7a99] border-[#dde3f0] text-xs font-normal rounded-sm">
              {companyType}
            </Badge>
          )}
        </div>
        <p style={{ margin: 0, fontSize: '0.82rem', color: '#6b7a99' }}>
          Delivery dashboard — monitor your deliveries, customers, drivers and status
        </p>
        <div style={{ height: 3, width: 56, background: '#3b6fd4', marginTop: '0.5rem' }} />
      </div>

      {/* ── Row 1: 4 stat cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: '1rem' }}>
        {STAT_CARDS(stats).map(({ label, value, sub, icon: Icon, accent, softBg }) => (
          <Card
            key={label}
            className="rounded-none shadow-none"
            style={{ border: '1px solid #dde3f0', borderTop: `3px solid ${accent}` }}
          >
            <CardContent className="pt-4 pb-4 px-5">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.65rem', fontWeight: 600, color: '#6b7a99', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {label}
                </span>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: softBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={15} style={{ color: accent }} />
                </div>
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#1a2340', lineHeight: 1 }}>
                {value.toLocaleString()}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#6b7a99', marginTop: 4 }}>{sub}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Row 2: Delivery statistics ── */}
      <Card className="rounded-none shadow-none" style={{ border: '1px solid #dde3f0' }}>
        <CardHeader className="pb-3 pt-4 px-5">
          <CardTitle style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', fontWeight: 600, color: '#1a2340' }}>
            <Activity size={15} style={{ color: '#3b6fd4' }} />
            Delivery statistics
          </CardTitle>
        </CardHeader>
        <Separator style={{ background: '#dde3f0' }} />
        <CardContent className="pt-4 px-5 pb-5">
          <DeliveryStatistics
            total={stats.totalDeliveryNotes}
            totalCustomers={stats.totalCustomers}
          />
        </CardContent>
      </Card>

      {/* ── Row 3: Status breakdown ── */}
      <Card className="rounded-none shadow-none" style={{ border: '1px solid #dde3f0' }}>
        <CardHeader className="pb-3 pt-4 px-5">
          <CardTitle style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1a2340' }}>
            Delivery status breakdown
          </CardTitle>
        </CardHeader>
        <Separator style={{ background: '#dde3f0' }} />
        <CardContent className="pt-4 px-5 pb-5">
          <StatusBreakdownCard statuses={stats.deliveriesByStatus} />
        </CardContent>
      </Card>

      {/* ── Row 4: Recent delivery notes ── */}
      <Card className="rounded-none shadow-none" style={{ border: '1px solid #dde3f0' }}>
        <CardHeader className="pb-3 pt-4 px-5">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <CardTitle style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1a2340' }}>
              Recent delivery notes
            </CardTitle>
            <span style={{ fontSize: '0.72rem', color: '#6b7a99' }}>{stats.totalDeliveryNotes} total</span>
          </div>
        </CardHeader>
        <Separator style={{ background: '#dde3f0' }} />
        <CardContent style={{ padding: 0 }}>
          <RecentDeliveryNotes
            notes={stats.recentDeliveryNotes}
            total={stats.totalDeliveryNotes}
          />
        </CardContent>
      </Card>

    </div>
  );
}