'use client';

import { Col, Row } from 'react-bootstrap';
import ComponentCard from '@/components/ComponentCard';
import ChartJSClient from '@/components/client-wrapper/ChartJSClient';
import { ArcElement, BarController, BarElement, BubbleController, DoughnutController, LineController, LineElement, PieController, PointElement, PolarAreaController, RadialLinearScale, ScatterController } from 'chart.js';
import { getBubbleChart, getComboBarLineChart, getDoughnutChart, getMultiPieChart, getPieChart, getPolarAreaChart, getScatterChart, getStackedBarLineChart } from '@/app/(admin)/charts/data';
const Page = () => {
  return <>
      <h4 className="mb-3 fw-bold">Other Charts</h4>

      <Row>
        <Col xl={6}>
          <ComponentCard title="Bubble">
            <div className="mt-3" style={{
            height: '300px'
          }}>
              <ChartJSClient type="bubble" getOptions={getBubbleChart} plugins={[BubbleController, PointElement]} />
            </div>
          </ComponentCard>
        </Col>

        <Col xl={6}>
          <ComponentCard title="Combo Bar & Line">
            <div className="mt-3" style={{
            height: '300px'
          }}>
              <ChartJSClient type="bar" getOptions={getComboBarLineChart} plugins={[BarController, LineController, PointElement, LineElement, BarElement]} />
            </div>
          </ComponentCard>
        </Col>

        <Col xl={6}>
          <ComponentCard title="Stacked Bar & Line">
            <div className="mt-3" style={{
            height: '300px'
          }}>
              <ChartJSClient type="bar" getOptions={getStackedBarLineChart} plugins={[BarController, LineController, PointElement, LineElement, BarElement]} />
            </div>
          </ComponentCard>
        </Col>

        <Col xl={6}>
          <ComponentCard title="Doughnut">
            <div className="mt-3" style={{
            height: '300px'
          }}>
              <ChartJSClient type="doughnut" getOptions={getDoughnutChart} plugins={[DoughnutController, PointElement, ArcElement]} />
            </div>
          </ComponentCard>
        </Col>

        <Col xl={6}>
          <ComponentCard title="Pie">
            <div className="mt-3" style={{
            height: '300px'
          }}>
              <ChartJSClient type="pie" getOptions={getPieChart} plugins={[PieController, PointElement, ArcElement]} />
            </div>
          </ComponentCard>
        </Col>

        <Col xl={6}>
          <ComponentCard title="Multi Series Pie">
            <div className="mt-3" style={{
            height: '300px'
          }}>
              <ChartJSClient type="pie" getOptions={getMultiPieChart} plugins={[PieController, PointElement, ArcElement]} />
            </div>
          </ComponentCard>
        </Col>

        <Col xl={6}>
          <ComponentCard title="Polar Area">
            <div className="mt-3" style={{
            height: '300px'
          }}>
              <ChartJSClient type="polarArea" getOptions={getPolarAreaChart} plugins={[PolarAreaController, RadialLinearScale, ArcElement]} />
            </div>
          </ComponentCard>
        </Col>

        <Col xl={6}>
          <ComponentCard title="Scatter">
            <div className="mt-3" style={{
            height: '300px'
          }}>
              <ChartJSClient type="scatter" getOptions={getScatterChart} plugins={[ScatterController, PointElement]} />
            </div>
          </ComponentCard>
        </Col>
      </Row>
    </>;
};
export default Page;