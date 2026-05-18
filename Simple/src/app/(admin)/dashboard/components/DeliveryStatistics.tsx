'use client';

import { Card, CardBody, CardFooter, Col, Row } from 'react-bootstrap';
import { LuTruck, LuCalendar, LuClock, LuUsers } from 'react-icons/lu';
import CountUpClient from '@/components/client-wrapper/CountUpClient';
import ChartJSClient from '@/components/client-wrapper/ChartJSClient';
import { Filler, LineController, LineElement, PointElement } from 'chart.js';
import { getColor } from '@/helpers/chart';

const deliveryTrendChart = () => ({
  data: {
    labels: ['0h', '3h', '6h', '9h', '12h', '15h', '18h', '21h'],
    datasets: [
      {
        label: 'Today',
        data: [2, 4, 3, 6, 5, 7, 6, 8],
        fill: true,
        borderColor: getColor('chart-primary'),
        backgroundColor: getColor('chart-primary-rgb', 0.2),
        tension: 0.4,
        pointRadius: 0,
        borderWidth: 1,
      },
      {
        label: 'Yesterday',
        data: [3, 5, 4, 7, 6, 8, 7, 9],
        fill: true,
        borderColor: getColor('chart-gray'),
        backgroundColor: getColor('chart-gray-rgb', 0.2),
        tension: 0.4,
        pointRadius: 0,
        borderWidth: 1,
      },
    ],
  },
});

const DeliveryStatistics = ({ total, totalCustomers }: { total: number; totalCustomers: number }) => (
  <Card>
    <CardBody>
      <Row className="align-items-center">
        <Col xl={3} md={6}>
          <div className="text-center">
            <p className="mb-4"><LuTruck /> Delivery Notes</p>
            <h2 className="fw-bold mb-0">
              <CountUpClient end={total} duration={2} enableScrollSpy scrollSpyOnce />
            </h2>
            <p className="text-muted">Total delivery notes in system</p>
            <p className="mb-0 mt-4"><LuCalendar /> Updated today</p>
          </div>
        </Col>
        <Col xl={3} md={6} className="order-xl-last">
          <div className="text-center">
            <p className="mb-4"><LuUsers /> Customers</p>
            <h2 className="fw-bold mb-0">
              <CountUpClient end={totalCustomers} duration={2} enableScrollSpy scrollSpyOnce />
            </h2>
            <p className="text-muted">Active customers</p>
            <p className="mb-0 mt-4"><LuClock /> Last synced: today</p>
          </div>
        </Col>
        <Col xl={6}>
          <div className="w-100" style={{ height: '240px' }}>
            <ChartJSClient type="line" getOptions={deliveryTrendChart} plugins={[LineController, LineElement, PointElement, Filler]} />
          </div>
        </Col>
      </Row>
    </CardBody>
    <CardFooter>
      <div className="d-flex align-items-center text-muted justify-content-between">
        <div>STRATOPOD Delivery Management System</div>
        <div>{total} delivery notes loaded</div>
      </div>
    </CardFooter>
  </Card>
);

export default DeliveryStatistics;
