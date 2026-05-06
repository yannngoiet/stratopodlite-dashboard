import { Col, Container, Row } from 'react-bootstrap';
import PageTitle from '@/components/PageTitle';
import { LuSparkles } from 'react-icons/lu';
import PromptsUsage from '@/app/(admin)/dashboard/components/PromptsUsage';
import ActiveUsers from '@/app/(admin)/dashboard/components/ActiveUsers';
import ResponseAccuracy from '@/app/(admin)/dashboard/components/ResponseAccuracy';
import TokenUsage from '@/app/(admin)/dashboard/components/TokenUsage';
import RequestStatistics from '@/app/(admin)/dashboard/components/RequestStatistics';
import RecentSessions from '@/app/(admin)/dashboard/components/RecentSessions';
import ModelUsageSummary from '@/app/(admin)/dashboard/components/ModelUsageSummary';
import APIPerformanceMetrics from '@/app/(admin)/dashboard/components/APIPerformanceMetrics';
export const metadata = {
  title: 'Dashboard'
};
const Page = () => {
  return <Container fluid>
      <PageTitle title="The Ultimate Admin & Dashboard Theme" subtitle="A premium collection of elegant, accessible components and a powerful codebase. Built for modern frameworks. Developer Friendly. Production Ready." badge={{
      title: 'Medium and Large Business',
      icon: LuSparkles
    }} />

      <Row className="row-cols-xxl-4 row-cols-md-2 row-cols-1">
        <Col>
          <PromptsUsage />
        </Col>

        <Col>
          <ActiveUsers />
        </Col>

        <Col>
          <ResponseAccuracy />
        </Col>

        <Col>
          <TokenUsage />
        </Col>
      </Row>

      <Row>
        <Col cols={12}>
          <RequestStatistics />
        </Col>
      </Row>

      <Row>
        <Col xxl={6}>
          <RecentSessions />
        </Col>

        <Col xxl={6}>
          <ModelUsageSummary />

          <APIPerformanceMetrics />
        </Col>
      </Row>
    </Container>;
};
export default Page;