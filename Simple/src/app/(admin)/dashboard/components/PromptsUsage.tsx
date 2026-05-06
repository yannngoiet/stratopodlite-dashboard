'use client';

import { Card, CardBody, CardFooter } from 'react-bootstrap';
import { LuMessageSquare } from 'react-icons/lu';
import { TbArrowUp } from 'react-icons/tb';
import CountUpClient from '@/components/client-wrapper/CountUpClient';
import ChartJSClient from '@/components/client-wrapper/ChartJSClient';
import { promptsUsageChart } from '@/app/(admin)/dashboard/data';
import { BarController, BarElement, CategoryScale, LinearScale } from 'chart.js';
const PromptsUsage = () => {
  return <Card className="card-h-100">
      <CardBody>
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div>
            <h5 className="text-uppercase">Today&#39;s Prompts</h5>
          </div>
          <div>
            <LuMessageSquare className="text-muted fs-24 svg-sw-10" />
          </div>
        </div>

        <div className="mb-3">
          <ChartJSClient type="bar" getOptions={promptsUsageChart} plugins={[BarController, BarElement, CategoryScale, LinearScale]} height="18px" />
        </div>

        <div className="d-flex justify-content-between">
          <div>
            <span className="text-muted">Today</span>
            <div className="fw-semibold">
              <span>
                <CountUpClient end={1245} duration={2} enableScrollSpy scrollSpyOnce />
              </span>{' '}
              prompts
            </div>
          </div>
          <div className="text-end">
            <span className="text-muted">Yesterday</span>
            <div className="fw-semibold">
              <span>
                <CountUpClient end={1110} duration={2} enableScrollSpy scrollSpyOnce />
              </span>
              <TbArrowUp />
            </div>
          </div>
        </div>
      </CardBody>
      <CardFooter className="text-muted text-center">
        Prompt volume increased by <strong>12%</strong> today
      </CardFooter>
    </Card>;
};
export default PromptsUsage;