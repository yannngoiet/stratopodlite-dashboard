'use client';

import { Card, CardBody } from 'react-bootstrap';
import { LuActivity } from 'react-icons/lu';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import type { DeliveryStatusStat } from '@/services/dashboardStatsService';

ChartJS.register(ArcElement, Tooltip, Legend);

const COLORS = ['#0d6efd', '#198754', '#20c997', '#ffc107', '#0dcaf0', '#dc3545', '#6c757d', '#fd7e14'];

const StatusBreakdownCard = ({ statuses }: { statuses: DeliveryStatusStat[] }) => {
  const total = statuses.reduce((sum, s) => sum + s.count, 0);

  const data = {
    labels: statuses.map(s => s.status),
    datasets: [{
      data: statuses.map(s => s.count),
      backgroundColor: statuses.map((_, i) => COLORS[i % COLORS.length]),
      borderColor: '#fff',
      borderWidth: 2,
      hoverOffset: 4,
    }],
  };

  const options = {
    cutout: '65%',
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

        {statuses.length === 0 ? (
          <p className="text-muted text-center py-4">No data yet</p>
        ) : (
          <div className="d-flex align-items-center gap-3">
            {/* Doughnut with total in center */}
            <div style={{ position: 'relative', width: 110, flexShrink: 0 }}>
              <Doughnut data={data} options={options as any} />
              <div style={{
                position: 'absolute', top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center', pointerEvents: 'none',
              }}>
                <div style={{ fontSize: 18, fontWeight: 700, lineHeight: 1 }}>{total}</div>
                <div style={{ fontSize: 10, color: '#6c757d', marginTop: 2 }}>Total</div>
              </div>
            </div>

            {/* Legend list */}
            <div className="d-flex flex-column gap-1" style={{ flex: 1, minWidth: 0 }}>
              {statuses.map((s, i) => (
                <div key={s.status} className="d-flex align-items-center justify-content-between gap-2">
                  <div className="d-flex align-items-center gap-1" style={{ minWidth: 0 }}>
                    <div style={{
                      width: 9, height: 9, borderRadius: '50%', flexShrink: 0,
                      backgroundColor: COLORS[i % COLORS.length],
                    }} />
                    <span style={{ fontSize: 11, color: '#495057', whiteSpace: 'nowrap',
                      overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {s.status}
                    </span>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#212529', flexShrink: 0 }}>
                    {s.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default StatusBreakdownCard;
