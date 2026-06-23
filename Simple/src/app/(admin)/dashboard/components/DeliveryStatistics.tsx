'use client';

import { Truck, Users, Calendar, Clock } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import CountUpClient from '@/components/client-wrapper/CountUpClient';
import ChartJSClient from '@/components/client-wrapper/ChartJSClient';
import { BarController, BarElement } from 'chart.js';
import type { RecentDeliveryNote } from '@/services/dashboardStatsService';

const buildBarChart = (notes: RecentDeliveryNote[]) => {
  const counts = new Map<string, number>();
  const labels = new Map<string, string>();

  notes.forEach(note => {
    const d = new Date(note.createdAt);
    const key = d.toISOString().split('T')[0];
    const label = d.toLocaleDateString('en-ZA', { day: '2-digit', month: 'short' });
    counts.set(key, (counts.get(key) || 0) + 1);
    labels.set(key, label);
  });

  const sorted = Array.from(counts.entries()).sort(([a], [b]) => a.localeCompare(b));

  return {
    data: {
      labels: sorted.map(([key]) => labels.get(key)!),
      datasets: [
        {
          label: 'Deliveries',
          data: sorted.map(([, count]) => count),
          backgroundColor: 'rgba(59,111,212,0.75)',
          hoverBackgroundColor: '#3b6fd4',
          borderRadius: 6,
          borderSkipped: false,
          barThickness: 20,
        },
      ],
    },
    options: {
      plugins: {
        legend: { display: false },
      },
      scales: {
        x: {
          ticks: { maxRotation: 0, minRotation: 0 },
          grid: { display: false },
        },
        y: {
          ticks: { stepSize: 1, precision: 0 },
          beginAtZero: true,
        },
      },
    },
  };
};

const DeliveryStatistics = ({
  total,
  totalDrivers,
  notes,
}: {
  total: number;
  totalDrivers: number;
  notes: RecentDeliveryNote[];
}) => (
  <div>
    <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr_1fr] gap-0">

      {/* Left — Delivery Notes stat */}
      <div className="flex flex-col items-center justify-center text-center px-6 py-4 border-r border-[#dde3f0]">
        <div className="flex items-center gap-2 dash-card-label mb-4">
          <Truck size={13} /> Delivery Notes
        </div>
        <div className="text-3xl font-extrabold text-[#3b6fd4] leading-none mb-1">
          <CountUpClient end={total} duration={2} enableScrollSpy scrollSpyOnce />
        </div>
        <p className="text-xs text-[#6b7a99] mb-4">Total delivery notes in system</p>
        <div className="flex items-center gap-1 text-xs text-[#6b7a99]">
          <Calendar size={12} /> Updated today
        </div>
      </div>

      {/* Center — Bar chart */}
      <div className="relative px-4 py-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="inline-block w-3 h-3 rounded-sm" style={{ background: '#3b6fd4' }} />
          <span className="text-xs text-[#6b7a99]">Deliveries per day</span>
        </div>
        <div className="w-full relative" style={{ height: '160px' }}>
          <ChartJSClient
            key={`bar-${notes.length}`}
            type="bar"
            getOptions={() => buildBarChart(notes)}
            plugins={[BarController, BarElement]}
          />
        </div>
      </div>

      {/* Right — Drivers stat */}
      <div className="flex flex-col items-center justify-center text-center px-6 py-4 border-l border-[#dde3f0]">
        <div className="flex items-center gap-2 dash-card-label mb-4">
          <Users size={13} /> Drivers
        </div>
        <div className="text-3xl font-extrabold text-[#29b6c5] leading-none mb-1">
          <CountUpClient end={totalDrivers} duration={2} enableScrollSpy scrollSpyOnce />
        </div>
        <p className="text-xs text-[#6b7a99] mb-4">Active drivers</p>
        <div className="flex items-center gap-1 text-xs text-[#6b7a99]">
          <Clock size={12} /> Last synced: today
        </div>
      </div>

    </div>

    <Separator className="bg-[#dde3f0]" />

    <div className="flex items-center justify-between px-5 py-3">
      <span className="text-xs text-[#6b7a99]">STRATOPOD Delivery Management System</span>
      <span className="text-xs text-[#6b7a99]">{total} delivery notes loaded</span>
    </div>
  </div>
);

export default DeliveryStatistics;
