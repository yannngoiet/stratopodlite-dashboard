'use client';

import { Users } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import CountUpClient from '@/components/client-wrapper/CountUpClient';

const CustomersCard = ({ total, totalDrivers }: { total: number; totalDrivers: number }) => {
  const progress = total > 0 ? Math.min((total / (total + 10)) * 100, 100) : 0;

  return (
    <Card className="rounded-none border-[#dde3f0] shadow-none h-full" style={{ borderTop: '3px solid #29b6c5' }}>
      <CardContent className="pt-3 px-5 pb-3">

        <div className="flex items-start justify-between mb-3">
          <div>
            <span className="dash-card-label">Customers</span>
            <div className="text-5xl font-extrabold text-[#1a2340] leading-none mt-2">
              <CountUpClient end={total} duration={2} enableScrollSpy scrollSpyOnce />
            </div>
            <p className="text-xs text-[#6b7a99] mt-1">Active customers</p>
          </div>
          <Users size={22} className="text-[#6b7a99]" />
        </div>

        <div className="h-1.5 rounded-full mb-3" style={{ background: '#f0f2f5' }}>
          <div className="h-full rounded-full" style={{ width: `${progress}%`, background: '#29b6c5', transition: 'width 0.4s ease' }} />
        </div>

        <div className="flex justify-between">
          <div>
            <div className="text-xs text-[#6b7a99]">Drivers</div>
            <div className="text-sm font-semibold text-[#1a2340]">{totalDrivers}</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-[#6b7a99]">Customers</div>
            <div className="text-sm font-semibold" style={{ color: '#29b6c5' }}>{total}</div>
          </div>
        </div>

      </CardContent>

      <CardFooter className="px-5 py-2 border-t border-[#f0f2f5]">
        <p className="text-xs text-[#6b7a99] text-center w-full">
          {total} active {total === 1 ? 'customer' : 'customers'} in the system
        </p>
      </CardFooter>
    </Card>
  );
};

export default CustomersCard;
