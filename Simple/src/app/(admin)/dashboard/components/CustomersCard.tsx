'use client';

import { Users } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import CountUpClient from '@/components/client-wrapper/CountUpClient';

const CustomersCard = ({ total, totalDrivers }: { total: number; totalDrivers: number }) => {
  const progress = total > 0 ? Math.min((total / (total + 10)) * 100, 100) : 0;

  return (
    <Card className="rounded-none border-[#dde3f0] shadow-none h-full" style={{ borderTop: '3px solid #29b6c5' }}>
      <CardContent className="pt-4 px-5 pb-4">

        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <span className="text-[10px] font-semibold text-[#6b7a99] uppercase tracking-wider">
              Customers
            </span>
            <div className="text-3xl font-extrabold text-[#1a2340] leading-none mt-2">
              <CountUpClient end={total} duration={2} enableScrollSpy scrollSpyOnce />
            </div>
            <p className="text-xs text-[#6b7a99] mt-1">Active customers</p>
          </div>
          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: '#f0fbfc' }}>
            <Users size={15} style={{ color: '#29b6c5' }} />
          </div>
        </div>

        {/* Progress bar */}
        <Progress
          value={progress}
          className="h-1.5 mb-4 bg-[#f0f2f5]"
          style={{ '--progress-color': '#29b6c5' } as React.CSSProperties}
        />

        {/* Stats row */}
        <div className="flex justify-between">
          <div>
            <div className="text-[10px] text-[#6b7a99]">Drivers</div>
            <div className="text-sm font-semibold text-[#1a2340]">{totalDrivers}</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-[#6b7a99]">Customers</div>
            <div className="text-sm font-semibold" style={{ color: '#29b6c5' }}>{total}</div>
          </div>
        </div>

      </CardContent>

      <CardFooter className="px-5 py-3 border-t border-[#f0f2f5]">
        <p className="text-xs text-[#6b7a99] text-center w-full">
          {total} active {total === 1 ? 'customer' : 'customers'} in the system
        </p>
      </CardFooter>
    </Card>
  );
};

export default CustomersCard;