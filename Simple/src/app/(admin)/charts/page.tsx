import PageTitle from '@/components/PageTitle';
import { LuChartBar } from 'react-icons/lu';
import { Container } from 'react-bootstrap';
import BasicCharts from '@/app/(admin)/charts/components/BasicCharts';
import BarCharts from '@/app/(admin)/charts/components/BarCharts';
import LineCharts from '@/app/(admin)/charts/components/LineCharts';
import OtherCharts from '@/app/(admin)/charts/components/OtherCharts';
const Page = () => {
  return <Container fluid>
      <PageTitle title="Charts & Graphs" subtitle="Visualize data with interactive and responsive charts powered by Chart.js — including bar, line, pie, and more." badge={{
      title: 'Chart.js Visuals',
      icon: LuChartBar
    }} />

      <BasicCharts />

      <BarCharts />

      <LineCharts />

      <OtherCharts />
    </Container>;
};
export default Page;