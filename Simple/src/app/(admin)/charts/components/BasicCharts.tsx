'use client';

import { Col, Row } from 'react-bootstrap';
import ComponentCard from '@/components/ComponentCard';
import ChartJSClient from '@/components/client-wrapper/ChartJSClient';
import { Filler, LineController, LineElement, PointElement, RadarController, RadialLinearScale } from 'chart.js';
import { getBasicAreaChart, getBoundedAreaChart, getDifferentDatasetChart, getDrawTimeChart, getRadarChart, getStackedAreaChart } from '@/app/(admin)/charts/data';
const Page = () => {
  return <Row>
      <Col xl={6}>
        <ComponentCard title="Basic Area">
          <div className="mt-3" style={{
          height: '300px'
        }}>
            <ChartJSClient type="line" getOptions={getBasicAreaChart} plugins={[LineController]} />
          </div>
        </ComponentCard>
      </Col>

      <Col xl={6}>
        <ComponentCard title="Different Dataset">
          <div className="mt-3" style={{
          height: '300px'
        }}>
            <ChartJSClient type="line" getOptions={getDifferentDatasetChart} plugins={[LineController]} />
          </div>
        </ComponentCard>
      </Col>

      <Col xl={6}>
        <ComponentCard title="Stacked">
          <div className="mt-3" style={{
          height: '300px'
        }}>
            <ChartJSClient type="line" getOptions={getStackedAreaChart} plugins={[LineController]} />
          </div>
        </ComponentCard>
      </Col>

      <Col xl={6}>
        <ComponentCard title="Boundaries">
          <div className="mt-3" style={{
          height: '300px'
        }}>
            <ChartJSClient type="line" getOptions={getBoundedAreaChart} plugins={[LineController]} />
          </div>
        </ComponentCard>
      </Col>

      <Col xl={6}>
        <ComponentCard title="Draw Time">
          <div className="mt-3" style={{
          height: '300px'
        }}>
            <ChartJSClient type="line" getOptions={getDrawTimeChart} plugins={[LineController]} />
          </div>
        </ComponentCard>
      </Col>

      <Col xl={6}>
        <ComponentCard title="Radar">
          <div className="mt-3" style={{
          height: '300px'
        }}>
            <ChartJSClient type="radar" getOptions={getRadarChart} plugins={[RadarController, RadialLinearScale, LineElement, PointElement, Filler]} />
          </div>
        </ComponentCard>
      </Col>
    </Row>;
};
export default Page;