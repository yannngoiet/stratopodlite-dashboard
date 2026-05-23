'use client';

import { useEffect, useState } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { LuTruck } from 'react-icons/lu';
import dashboardStatsService, { type DashboardStats } from '@/services/dashboardStatsService';
import DeliveryNotesCard from './components/DeliveryNotesCard';
import CustomersCard from './components/CustomersCard';
import StatusBreakdownCard from './components/StatusBreakdownCard';
import VehiclesCard from './components/VehiclesCard';
import DeliveryStatistics from './components/DeliveryStatistics';
import RecentDeliveryNotes from './components/RecentDeliveryNotes';
import XeroSyncDialog, { type XeroCompanyResult } from './components/XeroSyncDialog';

const empty: DashboardStats = {
  totalDeliveryNotes: 0,
  totalCustomers: 0,
  totalDrivers: 0,
  totalVehicles: 0,
  deliveriesByStatus: [],
  recentDeliveryNotes: [],
};

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>(empty);
  const [error, setError] = useState<string | null>(null);
  const [xeroCompanies, setXeroCompanies] = useState<XeroCompanyResult[] | null>(null);

  // Runs in the Xero callback tab — signals parent then closes itself
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const xero = params.get('xero');
    if (xero === 'connected') {
      const payload = params.get('payload') ?? '';
      let companies: XeroCompanyResult[] = [];
      try {
        companies = JSON.parse(atob(payload));
      } catch {
        // ignore malformed payload
      }
      localStorage.setItem('xero_callback', JSON.stringify({ companies }));
      if (window.opener) {
        window.close();
      } else {
        setXeroCompanies(companies);
        window.history.replaceState({}, '', '/dashboard');
      }
    }
  }, []);

  // Runs in the parent tab — listens for the callback tab's signal
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'xero_callback' && e.newValue) {
        try {
          const { companies } = JSON.parse(e.newValue);
          setXeroCompanies(companies);
        } catch {
          // ignore malformed payload
        }
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

  return (
    <Container fluid>
      {xeroCompanies && (
        <XeroSyncDialog
          companies={xeroCompanies}
          onClose={() => setXeroCompanies(null)}
        />
      )}
      <Row className="justify-content-center py-4">
        <Col xxl={5} xl={7} className="text-center">
          <span className="badge badge-default fw-normal shadow px-2 py-1 mb-2 fst-italic fs-xxs">
            <LuTruck className="me-1" /> Delivery Management
          </span>
          <h3 className="fw-bold">STRATOPOD Delivery Dashboard</h3>
          <p className="fs-md text-muted mb-2">
            Monitor your deliveries, customers, drivers and fleet in real time.
          </p>
        </Col>
      </Row>

      {error && <div className="alert alert-warning mb-3">{error}</div>}

      {/* ── Row 1: 4 stat cards ── */}
      <Row className="row-cols-xxl-4 row-cols-md-2 row-cols-1">
        <Col>
          <DeliveryNotesCard total={stats.totalDeliveryNotes} />
        </Col>
        <Col>
          <CustomersCard total={stats.totalCustomers} totalDrivers={stats.totalDrivers} />
        </Col>
        <Col>
          <StatusBreakdownCard statuses={stats.deliveriesByStatus} />
        </Col>
        <Col>
          <VehiclesCard total={stats.totalVehicles} />
        </Col>
      </Row>

      {/* ── Row 2: wide chart ── */}
      <Row>
        <Col cols={12}>
          <DeliveryStatistics
            total={stats.totalDeliveryNotes}
            totalCustomers={stats.totalCustomers}
          />
        </Col>
      </Row>

      {/* ── Row 3: recent delivery notes ── */}
      <Row>
        <Col xxl={12}>
          <RecentDeliveryNotes
            notes={stats.recentDeliveryNotes}
            total={stats.totalDeliveryNotes}
          />
        </Col>
      </Row>
    </Container>
  );
}