'use client';

import { Card, CardBody, CardFooter } from 'react-bootstrap';
import { LuCar } from 'react-icons/lu';
import { TbArrowUp } from 'react-icons/tb';
import CountUpClient from '@/components/client-wrapper/CountUpClient';
import ChartJSClient from '@/components/client-wrapper/ChartJSClient';
import { Filler, LineController, LineElement, PointElement } from 'chart.js';
import { getColor } from '@/helpers/chart';

const vehicleLineChart = () => ({
  data: {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      data: [2, 4, 3, 5, 4, 6, 5],
      backgroundColor: getColor('chart-primary-rgb', 0.1),
      borderColor: getColor('chart-primary'),
      tension: 0.4,
      fill: true,
      pointRadius: 0,
      borderWidth: 2,
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

const VehiclesCard = ({ total }: { total: number }) => (
  <Card className="card-h-100">
    <CardBody>
      <div className="d-flex justify-content-between align-items-start mb-3">
        <h5 className="text-uppercase">Vehicles</h5>
        <LuCar className="text-muted fs-24 svg-sw-10" />
      </div>
      <div className="mb-3">
        <ChartJSClient type="line" getOptions={vehicleLineChart} plugins={[LineController, LineElement, PointElement, Filler]} height="16px" />
      </div>
      <div className="d-flex justify-content-between">
        <div>
          <span className="text-muted">Fleet Size</span>
          <div className="fw-semibold">
            <CountUpClient end={total} duration={2} enableScrollSpy scrollSpyOnce /> vehicles
          </div>
        </div>
        <div className="text-end">
          <span className="text-muted">Active</span>
          <div className="fw-semibold">
            {total} <TbArrowUp />
          </div>
        </div>
      </div>
    </CardBody>
    <CardFooter className="text-muted text-center">
      Total fleet: <strong>{total}</strong> vehicles registered
    </CardFooter>
  </Card>
);

export default VehiclesCard;
