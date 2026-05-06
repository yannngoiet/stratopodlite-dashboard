'use client';

import { Card, CardBody, CardFooter } from 'react-bootstrap';
import { LuCpu } from 'react-icons/lu';
import CountUpClient from '@/components/client-wrapper/CountUpClient';
import { TbArrowUp } from 'react-icons/tb';
import { tokenUsageChart } from '@/app/(admin)/dashboard/data';
import ChartJSClient from '@/components/client-wrapper/ChartJSClient';
import { Filler, LineController, LineElement, PointElement } from 'chart.js';
const TokenUsage = () => {
  return <Card className="card-h-100">
      <CardBody>
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div>
            <h5 className="text-uppercase">Token Usage</h5>
          </div>
          <div>
            <LuCpu className="text-muted fs-24 svg-sw-10" />
          </div>
        </div>

        <div className="mb-3">
          <ChartJSClient type="line" getOptions={tokenUsageChart} plugins={[LineController, LineElement, PointElement, Filler]} height="16px" />
        </div>

        <div className="d-flex justify-content-between">
          <div>
            <span className="text-muted">Today</span>
            <div className="fw-semibold">
              <span>
                <CountUpClient end={920400} duration={2} enableScrollSpy scrollSpyOnce />
              </span>{' '}
              tokens
            </div>
          </div>
          <div className="text-end">
            <span className="text-muted">Yesterday</span>
            <div className="fw-semibold">
              <span>
                <CountUpClient end={865100} duration={2} enableScrollSpy scrollSpyOnce />
              </span>
              <TbArrowUp />
            </div>
          </div>
        </div>
      </CardBody>
      <CardFooter className="text-muted text-center">
        Token usage up <strong>6.4%</strong> from yesterday
      </CardFooter>
    </Card>;
};
export default TokenUsage;