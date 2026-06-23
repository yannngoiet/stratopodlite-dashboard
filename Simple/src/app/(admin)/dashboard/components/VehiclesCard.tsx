'use client';

import { Car, Truck, TruckIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import CountUpClient from '@/components/client-wrapper/CountUpClient';

const VehiclesCard = ({ total }: { total: number }) => (
  <Card className="rounded-none border-[#dde3f0] shadow-none h-full" style={{ borderTop: '3px solid #29b6c5' }}>
    <CardContent className="pt-3 px-5 pb-3 flex flex-col h-full">

      <div className="flex items-center justify-between mb-3">
        <span className="dash-card-label">Vehicles</span>
        <Car size={22} className="text-[#6b7a99]" />
      </div>

      <div className="flex flex-col items-center justify-center flex-1 py-1">
        <div className={`dash-icon-circle w-16 h-16 mb-2 ${total > 0 ? 'dash-icon-circle-teal' : ''}`}
          style={total === 0 ? { background: 'rgba(107,122,153,0.12)' } : {}}>
          {total > 0
            ? <Truck size={30} className="dash-text-teal" />
            : <TruckIcon size={30} className="dash-text-muted" />}
        </div>

        <div
          className="text-5xl font-extrabold leading-none"
          style={{ color: total > 0 ? '#29b6c5' : '#6b7a99' }}
        >
          {total > 0
            ? <CountUpClient end={total} duration={2} enableScrollSpy scrollSpyOnce />
            : '0'}
        </div>
        <div className="text-xs text-[#6b7a99] mt-1">
          {total === 1 ? 'vehicle registered' : 'vehicles registered'}
        </div>
      </div>

      <div
        className="flex justify-between pt-2 mt-1"
        style={{ borderTop: '1px solid #f0f2f5' }}
      >
        <div>
          <div className="text-xs text-[#6b7a99]">Fleet Size</div>
          <div className="text-sm font-semibold text-[#1a2340]">{total}</div>
        </div>
        <div className="text-right">
          <div className="text-xs text-[#6b7a99]">Active</div>
          <div className="text-sm font-semibold" style={{ color: '#29b6c5' }}>{total}</div>
        </div>
      </div>

    </CardContent>
  </Card>
);

export default VehiclesCard;
