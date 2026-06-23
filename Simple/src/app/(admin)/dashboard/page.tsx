'use client';

import { useEffect, useState } from 'react';
import { TriangleAlert, Check, X, FileText } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import dashboardStatsService, { type DashboardStats } from '@/services/dashboardStatsService';
import DeliveryStatistics from './components/DeliveryStatistics';
import StatusBreakdownCard from './components/StatusBreakdownCard';
import RecentDeliveryNotes from './components/RecentDeliveryNotes';
import DeliveryNotesCard from './components/DeliveryNotesCard';
import CustomersCard from './components/CustomersCard';
import VehiclesCard from './components/VehiclesCard';

const empty: DashboardStats = {
  totalDeliveryNotes:  0,
  totalCustomers:      0,
  totalDrivers:        0,
  totalVehicles:       0,
  deliveriesByStatus:  [],
  recentDeliveryNotes: [],
};

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
    <div className="container-fluid" style={{ padding: '1.5rem' }}>

      {/* ── Banners ── */}
      {xeroSuccess && (
        <Alert className="border-emerald-200 bg-emerald-50 text-emerald-800 flex items-center justify-between rounded-none mb-3">
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
        <Alert className="border-blue-200 bg-blue-50 text-blue-800 flex items-center justify-between rounded-none mb-3">
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
        <Alert className="border-amber-200 bg-amber-50 text-amber-800 rounded-none flex items-center gap-2 mb-3">
          <TriangleAlert size={15} />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* ── Page header ── */}
      <div className="mb-3 text-center" style={{ padding: '0.5rem 0 1rem' }}>
        {companyType && (
          <Badge variant="outline" className="text-[#6b7a99] border-[#dde3f0] text-xs font-normal rounded-sm mb-2">
            {companyType}
          </Badge>
        )}
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: '#1a2340' }}>
          {companyName} — Delivery Dashboard
        </h1>
        <p style={{ margin: '0.35rem 0 0', fontSize: '0.82rem', color: '#6b7a99' }}>
          Monitor your deliveries, customers, drivers and status.
        </p>
      </div>

      {/* ── Row 1: 4 stat cards ── */}
      <div className="row g-3 mb-3">
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="dash-card-wrapper">
            <DeliveryNotesCard total={stats.totalDeliveryNotes} />
          </div>
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="dash-card-wrapper">
            <CustomersCard total={stats.totalCustomers} totalDrivers={stats.totalDrivers} />
          </div>
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="dash-card-wrapper">
            <StatusBreakdownCard statuses={stats.deliveriesByStatus} />
          </div>
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="dash-card-wrapper">
            <VehiclesCard total={stats.totalVehicles} />
          </div>
        </div>
      </div>

      {/* ── Row 2: Delivery statistics chart ── */}
      <div className="row g-3 mb-3">
        <div className="col-12">
          <div className="dash-card-wrapper">
            <DeliveryStatistics
              total={stats.totalDeliveryNotes}
              totalDrivers={stats.totalDrivers}
              notes={stats.recentDeliveryNotes}
            />
          </div>
        </div>
      </div>

      {/* ── Row 3: Recent delivery notes table ── */}
      <div className="row g-3">
        <div className="col-12">
          <div className="dash-card">
            <div className="flex items-center justify-between px-4 py-3">
              <h2 className="dash-section-title">Recent Delivery Notes</h2>
              <Link href="/delivery-notes">
                <Button size="sm" className="h-8 text-xs rounded-md gap-1.5 !bg-[#3b6fd4] !text-white border-none">
                  <FileText size={13} /> View All
                </Button>
              </Link>
            </div>
            <div style={{ height: 1, background: '#dde3f0' }} />
            <RecentDeliveryNotes
              notes={stats.recentDeliveryNotes}
              total={stats.totalDeliveryNotes}
            />
          </div>
        </div>
      </div>

    </div>
  );
}
