'use client';

import { Activity } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import type { DeliveryStatusStat } from '@/services/dashboardStatsService';

ChartJS.register(ArcElement, Tooltip, Legend);

const COLORS = [
  '#10b981', // delivered  — emerald
  '#3b6fd4', // in transit — primary blue
  '#EF9F27', // pending    — amber
  '#ef4444', // failed     — red
  '#29b6c5', // other      — teal
  '#8b5cf6', // extra      — violet
  '#6b7a99', // extra      — muted
  '#f59e0b', // extra      — yellow
];

const StatusBreakdownCard = ({ statuses }: { statuses: DeliveryStatusStat[] }) => {
  const total = statuses.reduce((sum, s) => sum + s.count, 0);

  const data = {
    labels: statuses.map(s => s.status),
    datasets: [{
      data:            statuses.map(s => s.count),
      backgroundColor: statuses.map((_, i) => COLORS[i % COLORS.length]),
      borderColor:     '#ffffff',
      borderWidth:     2,
      hoverOffset:     4,
    }],
  };

  const options = {
    cutout: '65%',
    plugins: {
      legend:  { display: false },
      tooltip: { callbacks: { label: (c: any) => ` ${c.label}: ${c.parsed}` } },
    },
  };

  return (
    <Card className="rounded-none border-[#dde3f0] shadow-none h-full" style={{ borderTop: '3px solid #3b6fd4' }}>
      <CardContent className="pt-3 px-5 pb-3">

        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <span className="dash-card-label">Delivery Status</span>
          <Activity size={22} className="text-[#6b7a99]" />
        </div>

        {statuses.length === 0 ? (
          <p className="text-xs text-[#6b7a99] text-center py-6">No data yet</p>
        ) : (
          <div className="flex flex-col items-center">

            {/* Doughnut — larger, centered */}
            <div className="relative" style={{ width: 140, height: 140 }}>
              <Doughnut data={data} options={options as any} />
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-extrabold text-[#1a2340] leading-none">{total}</span>
                <span className="text-[10px] text-[#6b7a99] mt-0.5">Total</span>
              </div>
            </div>

            {/* Status details below */}
            <div className="w-full mt-4 flex flex-col gap-2.5">
              {statuses.map((s, i) => (
                <div key={s.status} className="flex items-center gap-2">
                  <div
                    className="flex-shrink-0 rounded-sm"
                    style={{ width: 8, height: 8, backgroundColor: COLORS[i % COLORS.length] }}
                  />
                  <span className="text-xs text-[#6b7a99] flex-1">{s.status}</span>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ width: 56, background: '#f0f2f5' }}>
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${Math.round((s.count / total) * 100)}%`, background: COLORS[i % COLORS.length] }}
                    />
                  </div>
                  <span className="text-xs font-bold text-[#1a2340] w-5 text-right">{s.count}</span>
                </div>
              ))}
            </div>

          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StatusBreakdownCard;