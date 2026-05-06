'use client';

import { Col, Row } from 'react-bootstrap';
import ComponentCard from '@/components/ComponentCard';
import ChartJSClient from '@/components/client-wrapper/ChartJSClient';
import { getBasicLineChart, getInterpolationLineChart, getLineSegmentsChart, getMultiAxisLineChart, getPointStyleLineChart, getSteppedLineChart } from '@/app/(admin)/charts/data';
import { Filler, LineController, LineElement, PointElement } from 'chart.js';
const Page = () => {
  return <>
      <h4 className="mb-3 fw-bold">Line Charts</h4>

      <Row>
        <Col xl={6}>
          <ComponentCard title="Basic Line">
            <div className="mt-3" style={{
            height: '300px'
          }}>
              <ChartJSClient type="line" getOptions={getBasicLineChart} plugins={[LineController, PointElement, LineElement, Filler]} />
            </div>
          </ComponentCard>
        </Col>

        <Col xl={6}>
          <ComponentCard title="Interpolation">
            <div className="mt-3" style={{
            height: '300px'
          }}>
              <ChartJSClient type="line" getOptions={getInterpolationLineChart} plugins={[LineController, PointElement, LineElement]} />
            </div>
          </ComponentCard>
        </Col>

        <Col xl={6}>
          <ComponentCard title="Multi-Axes">
            <div className="mt-3" style={{
            height: '300px'
          }}>
              <ChartJSClient type="line" getOptions={getMultiAxisLineChart} plugins={[LineController]} />
            </div>
          </ComponentCard>
        </Col>

        <Col xl={6}>
          <ComponentCard title="Point Styling">
            <div className="mt-3" style={{
            height: '300px'
          }}>
              <ChartJSClient type="line" getOptions={getPointStyleLineChart} plugins={[LineController]} />
            </div>
          </ComponentCard>
        </Col>

        <Col xl={6}>
          <ComponentCard title="Line Segment">
            <div className="mt-3" style={{
            height: '300px'
          }}>
              <ChartJSClient type="line" getOptions={getLineSegmentsChart} plugins={[LineController]} />
            </div>
          </ComponentCard>
        </Col>

        <Col xl={6}>
          <ComponentCard title="Stepped">
            <div className="mt-3" style={{
            height: '300px'
          }}>
              <ChartJSClient type="line" getOptions={getSteppedLineChart} plugins={[LineController]} />
            </div>
          </ComponentCard>
        </Col>
      </Row>
    </>;
};
export default Page;