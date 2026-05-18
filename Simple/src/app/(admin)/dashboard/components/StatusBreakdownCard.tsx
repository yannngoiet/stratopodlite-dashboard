'use client';

import { Card, CardBody, CardFooter } from 'react-bootstrap';
import { LuActivity } from 'react-icons/lu';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import type { DeliveryStatusStat } from '@/services/dashboardStatsService';

ChartJS.register(ArcElement, Tooltip, Legend);

const COLORS = ['#0d6efd', '#198754', '#20c997', '#ffc107', '#0dcaf0', '#dc3545', '#6c757d'];

const StatusBreakdownCard = ({ statuses }: { statuses: DeliveryStatusStat[] }) => {
  const topStatus = statuses.length ? statuses.reduce((a, b) => a.count > b.count ? a : b).status : '-';

  const data = {
    labels: statuses.map(s => s.status),
    datasets: [{
      data: statuses.map(s => s.count),
      backgroundColor: statuses.map((_, i) => COLORS[i % COLORS.length]),
      borderColor: statuses.map((_, i) => COLORS[i % COLORS.length]),
      borderWidth: 1,
    }],
  };

  const options = {
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: (c: any) => ` ${c.label}: ${c.parsed}` } },
    },
  };

  return (
    <Card className="card-h-100">
      <CardBody>
        <div className="d-flex justify-content-between align-items-start mb-3">
          <h5 className="text-uppercase">Delivery Status</h5>
          <LuActivity className="text-muted fs-24 svg-sw-10" />
        </div>
        <div className="d-flex align-items-center justify-content-center">
          {statuses.length > 0
            ? <Pie data={data} options={options} style={{ maxHeight: '120px' }} />
            : <p className="text-muted py-4">No data yet</p>}
        </div>
      </CardBody>
      <CardFooter className="text-muted text-center">
        Most common: <strong>{topStatus}</strong>
      </CardFooter>
    </Card>
  );
};

export default StatusBreakdownCard;
