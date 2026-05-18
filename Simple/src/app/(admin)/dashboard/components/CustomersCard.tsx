'use client';

import { Card, CardBody, CardFooter, ProgressBar } from 'react-bootstrap';
import { LuUsers } from 'react-icons/lu';
import CountUpClient from '@/components/client-wrapper/CountUpClient';

const CustomersCard = ({ total, totalDrivers }: { total: number; totalDrivers: number }) => (
  <Card className="card-h-100">
    <CardBody>
      <div className="d-flex justify-content-between align-items-start">
        <div>
          <h5 className="text-uppercase mb-3">Customers</h5>
          <h3 className="mb-0 fw-normal">
            <CountUpClient end={total} duration={2} enableScrollSpy scrollSpyOnce />
          </h3>
          <p className="text-muted mb-2">Active customers</p>
        </div>
        <LuUsers className="text-muted fs-24 svg-sw-10" />
      </div>
      <ProgressBar now={total > 0 ? Math.min((total / (total + 10)) * 100, 100) : 0} className="progress-lg mb-3" />
      <div className="d-flex justify-content-between">
        <div>
          <span className="text-muted">Drivers</span>
          <h5 className="mb-0">{totalDrivers}</h5>
        </div>
        <div className="text-end">
          <span className="text-muted">Customers</span>
          <h5 className="mb-0">{total}</h5>
        </div>
      </div>
    </CardBody>
    <CardFooter className="text-muted text-center">
      {total} active customers in the system
    </CardFooter>
  </Card>
);

export default CustomersCard;
