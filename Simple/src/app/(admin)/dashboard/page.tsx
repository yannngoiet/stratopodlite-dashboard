'use client';

import { useEffect, useState } from 'react';
import { Alert, Col, Container, Row } from 'react-bootstrap';
import { LuCheck } from 'react-icons/lu';
import dashboardStatsService, { type DashboardStats } from '@/services/dashboardStatsService';
import DeliveryNotesCard from './components/DeliveryNotesCard';
import CustomersCard from './components/CustomersCard';
import StatusBreakdownCard from './components/StatusBreakdownCard';
import VehiclesCard from './components/VehiclesCard';
import DeliveryStatistics from './components/DeliveryStatistics';
import RecentDeliveryNotes from './components/RecentDeliveryNotes';

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
  const [xeroSuccess, setXeroSuccess] = useState(false);
  const [xeroAlreadyConnected, setXeroAlreadyConnected] = useState(false);
  const [companyName, setCompanyName] = useState('STRATOPOD');
  const [companyType, setCompanyType] = useState('');

  // Runs in the Xero callback tab — signals parent then closes
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const xeroParam = params.get('xero');

    if (xeroParam === 'connected') {
      const channel = new BroadcastChannel('xero_callback');
      channel.postMessage({ connected: true });
      channel.close();

      if (window.opener) {
        window.close();
      } else {
        setXeroSuccess(true);
        window.history.replaceState({}, '', '/dashboard');
      }
    } else if (xeroParam === 'already_connected') {
      setXeroAlreadyConnected(true);
      window.history.replaceState({}, '', '/dashboard');
    }
  }, []);

  // Runs in the parent tab — listens for the callback tab's signal
  useEffect(() => {
    const channel = new BroadcastChannel('xero_callback');
    channel.onmessage = () => setXeroSuccess(true);
    return () => channel.close();
  }, []);

  // Legacy localStorage fallback (kept for safety)
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
    const user = localStorage.getItem('user')
    if (user) {
      const parsed = JSON.parse(user)
      if (parsed.companyName) setCompanyName(parsed.companyName)
      if (parsed.companyType) setCompanyType(parsed.companyType)
    }
  }, []);

  return (
    <Container fluid>
      {xeroSuccess && (
        <Alert
          variant="success"
          dismissible
          onClose={() => setXeroSuccess(false)}
          className="d-flex align-items-center gap-2 mb-3"
        >
          <LuCheck size={18} />
          <strong>Xero connected successfully!</strong>
        </Alert>
      )}
      {xeroAlreadyConnected && (
        <Alert
          variant="info"
          dismissible
          onClose={() => setXeroAlreadyConnected(false)}
          className="d-flex align-items-center gap-2 mb-3"
        >
          <LuCheck size={18} />
          <strong>This Xero organisation is already connected.</strong>
        </Alert>
      )}
      <Row className="justify-content-center py-4">
        <Col xxl={5} xl={7} className="text-center">
          <span className="badge badge-default fw-normal shadow px-2 py-1 mb-2 fst-italic fs-xxs">
            {companyType && <span className="fw-semibold">{companyType} </span>}
            {/* <LuTruck className="me-1" /> Delivery Management */}
          </span>
          <h3 className="fw-bold">{companyName} - Delivery Dashboard</h3>
          <p className="fs-md text-muted mb-2">
            Monitor your deliveries, customers, drivers and status.
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