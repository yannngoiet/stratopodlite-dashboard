'use client';

import { Car, Truck, TruckIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import CountUpClient from '@/components/client-wrapper/CountUpClient';

const VehiclesCard = ({ total }: { total: number }) => (
  <Card className="rounded-none border-[#dde3f0] shadow-none h-full" style={{ borderTop: '3px solid #29b6c5' }}>
    <CardContent className="pt-4 px-5 pb-4 flex flex-col h-full">

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-[10px] font-semibold text-[#6b7a99] uppercase tracking-wider">
          Vehicles
        </span>
        <Car size={16} className="text-[#6b7a99]" />
      </div>

      {/* Center content */}
      <div className="flex flex-col items-center justify-center flex-1 py-2">
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center mb-3"
          style={{ background: total > 0 ? 'rgba(41,182,197,0.1)' : 'rgba(107,122,153,0.1)' }}
        >
          {total > 0
            ? <Truck size={26} style={{ color: '#29b6c5' }} />
            : <TruckIcon size={26} style={{ color: '#6b7a99' }} />}
        </div>

        <div
          className="text-4xl font-extrabold leading-none"
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

      {/* Footer stats */}
      <div
        className="flex justify-between pt-3 mt-2"
        style={{ borderTop: '1px solid #f0f2f5' }}
      >
        <div>
          <div className="text-[10px] text-[#6b7a99]">Fleet Size</div>
          <div className="text-sm font-semibold text-[#1a2340]">{total}</div>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-[#6b7a99]">Active</div>
          <div className="text-sm font-semibold" style={{ color: '#29b6c5' }}>{total}</div>
        </div>
      </div>

    </CardContent>
  </Card>
);

export default VehiclesCard;