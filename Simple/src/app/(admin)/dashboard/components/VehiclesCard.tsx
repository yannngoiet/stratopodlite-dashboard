'use client';

import { Card, CardBody } from 'react-bootstrap';
import { LuCar } from 'react-icons/lu';
import { TbTruck, TbTruckOff } from 'react-icons/tb';
import CountUpClient from '@/components/client-wrapper/CountUpClient';

const VehiclesCard = ({ total }: { total: number }) => (
  <Card className="card-h-100">
    <CardBody className="d-flex flex-column">
      <div className="d-flex justify-content-between align-items-start mb-2">
        <h5 className="text-uppercase mb-0">Vehicles</h5>
        <LuCar className="text-muted fs-24 svg-sw-10" />
      </div>

      <div className="d-flex flex-column align-items-center justify-content-center flex-grow-1 py-2">
        {/* Icon */}
        <div style={{
          width: 56, height: 56, borderRadius: '50%',
          background: total > 0 ? 'rgba(13,110,253,0.1)' : 'rgba(108,117,125,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 10,
        }}>
          {total > 0
            ? <TbTruck size={28} color="#0d6efd" />
            : <TbTruckOff size={28} color="#6c757d" />}
        </div>

        {/* Big number */}
        <div style={{ fontSize: 36, fontWeight: 700, lineHeight: 1, color: total > 0 ? '#0d6efd' : '#6c757d' }}>
          {total > 0
            ? <CountUpClient end={total} duration={2} enableScrollSpy scrollSpyOnce />
            : '0'}
        </div>
        <div className="text-muted mt-1" style={{ fontSize: 12 }}>
          {total === 1 ? 'vehicle registered' : 'vehicles registered'}
        </div>
      </div>

      {/* Bottom stats row */}
      <div className="d-flex justify-content-between pt-2" style={{ borderTop: '1px solid #f0f0f0' }}>
        <div>
          <div className="text-muted" style={{ fontSize: 11 }}>Fleet Size</div>
          <div className="fw-semibold" style={{ fontSize: 13 }}>{total}</div>
        </div>
        <div className="text-end">
          <div className="text-muted" style={{ fontSize: 11 }}>Active</div>
          <div className="fw-semibold text-success" style={{ fontSize: 13 }}>{total}</div>
        </div>
      </div>
    </CardBody>
  </Card>
);

export default VehiclesCard;
