'use client';

import { Truck, Users, Calendar, Clock } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import CountUpClient from '@/components/client-wrapper/CountUpClient';
import ChartJSClient from '@/components/client-wrapper/ChartJSClient';
import { Filler, LineController, LineElement, PointElement } from 'chart.js';

const deliveryTrendChart = () => ({
  data: {
    labels: ['0h', '3h', '6h', '9h', '12h', '15h', '18h', '21h'],
    datasets: [
      {
        label: 'Today',
        data: [2, 4, 3, 6, 5, 7, 6, 8],
        fill: true,
        borderColor: '#3b6fd4',
        backgroundColor: 'rgba(59,111,212,0.15)',
        tension: 0.4,
        pointRadius: 0,
        borderWidth: 2,
        borderDash: [],
      },
      {
        label: 'Yesterday',
        data: [3, 5, 4, 7, 6, 8, 7, 9],
        fill: true,
        borderColor: '#29b6c5',
        backgroundColor: 'rgba(41,182,197,0.08)',
        tension: 0.4,
        pointRadius: 0,
        borderWidth: 2,
        borderDash: [5, 3],
      },
    ],
  },
});

const DeliveryStatistics = ({ total, totalCustomers }: { total: number; totalCustomers: number }) => (
  <div>
    <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr_1fr] gap-0">

      {/* Left — Delivery Notes stat */}
      <div className="flex flex-col items-center justify-center text-center px-6 py-4 border-r border-[#dde3f0]">
        <div className="flex items-center gap-2 text-xs text-[#6b7a99] mb-4">
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

      {/* Center — Chart */}
      <div className="relative px-4 py-4">
        <div className="flex items-center gap-4 mb-3">
          <div className="flex items-center gap-1.5 text-xs text-[#6b7a99]">
            <span className="inline-block w-3 h-[2px] bg-[#3b6fd4]" />
            Today
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#6b7a99]">
            <span className="inline-block w-3 h-[2px] bg-[#29b6c5] border-dashed" style={{ borderTop: '2px dashed #29b6c5', background: 'none' }} />
            Yesterday
          </div>
        </div>
        <div className="w-full relative" style={{ height: '160px' }}>
          <ChartJSClient
            type="line"
            getOptions={deliveryTrendChart}
            plugins={[LineController, LineElement, PointElement, Filler]}
          />
        </div>
      </div>

      {/* Right — Customers stat */}
      <div className="flex flex-col items-center justify-center text-center px-6 py-4 border-l border-[#dde3f0]">
        <div className="flex items-center gap-2 text-xs text-[#6b7a99] mb-4">
          <Users size={13} /> Customers
        </div>
        <div className="text-3xl font-extrabold text-[#29b6c5] leading-none mb-1">
          <CountUpClient end={totalCustomers} duration={2} enableScrollSpy scrollSpyOnce />
        </div>
        <p className="text-xs text-[#6b7a99] mb-4">Active customers</p>
        <div className="flex items-center gap-1 text-xs text-[#6b7a99]">
          <Clock size={12} /> Last synced: today
        </div>
      </div>

    </div>

    <Separator className="bg-[#dde3f0]" />

    {/* Footer */}
    <div className="flex items-center justify-between px-5 py-3">
      <span className="text-xs text-[#6b7a99]">STRATOPOD Delivery Management System</span>
      <span className="text-xs text-[#6b7a99]">{total} delivery notes loaded</span>
    </div>
  </div>
);

export default DeliveryStatistics;