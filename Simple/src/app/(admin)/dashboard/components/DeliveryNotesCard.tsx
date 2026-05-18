'use client';

import { Card, CardBody, CardFooter } from 'react-bootstrap';
import { LuTruck } from 'react-icons/lu';
import CountUpClient from '@/components/client-wrapper/CountUpClient';
import ChartJSClient from '@/components/client-wrapper/ChartJSClient';
import { BarController, BarElement, CategoryScale, LinearScale } from 'chart.js';
import { getColor } from '@/helpers/chart';

const deliveryBarChart = () => ({
  data: {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      data: [3, 5, 4, 7, 6, 8, 5],
      backgroundColor: getColor('chart-primary'),
      borderRadius: 4,
      borderSkipped: false,
    }],
  },
  options: {
    plugins: { legend: { display: false }, tooltip: { enabled: false } },
    scales: {
      x: { display: false, grid: { display: false } },
      y: { display: false, grid: { display: false } },
    },
  },
});

const DeliveryNotesCard = ({ total }: { total: number }) => (
  <Card className="card-h-100">
    <CardBody>
      <div className="d-flex justify-content-between align-items-start mb-3">
        <h5 className="text-uppercase">Delivery Notes</h5>
        <LuTruck className="text-muted fs-24 svg-sw-10" />
      </div>
      <div className="mb-3">
        <ChartJSClient type="bar" getOptions={deliveryBarChart} plugins={[BarController, BarElement, CategoryScale, LinearScale]} height="18px" />
      </div>
      <div className="d-flex justify-content-between">
        <div>
          <span className="text-muted">Total</span>
          <div className="fw-semibold">
            <CountUpClient end={total} duration={2} enableScrollSpy scrollSpyOnce /> notes
          </div>
        </div>
        <div className="text-end">
          <span className="text-muted">In System</span>
          <div className="fw-semibold">{total}</div>
        </div>
      </div>
    </CardBody>
    <CardFooter className="text-muted text-center">
      All delivery notes in the system
    </CardFooter>
  </Card>
);

export default DeliveryNotesCard;
