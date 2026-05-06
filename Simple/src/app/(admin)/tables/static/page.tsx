import { Col, Container, Row } from 'react-bootstrap';
import PageTitle from '@/components/PageTitle';
import { LuTable } from 'react-icons/lu';
import BasicTable from '@/app/(admin)/tables/static/components/BasicTable';
import CustomTable from '@/app/(admin)/tables/static/components/CustomTable';
import TableVariants from '@/app/(admin)/tables/static/components/TableVariants';
import StripedRowTable from '@/app/(admin)/tables/static/components/StripedRowTable';
import StripedColumnTable from '@/app/(admin)/tables/static/components/StripedColumnTable';
import HoverableRowsTable from '@/app/(admin)/tables/static/components/HoverableRowsTable';
import ActiveRowTable from '@/app/(admin)/tables/static/components/ActiveRowTable';
import BorderedTable from '@/app/(admin)/tables/static/components/BorderedTable';
import BorderlessTable from '@/app/(admin)/tables/static/components/BorderlessTable';
import SmallTable from '@/app/(admin)/tables/static/components/SmallTable';
import TableGroupDividers from '@/app/(admin)/tables/static/components/TableGroupDividers';
import NestedTable from '@/app/(admin)/tables/static/components/NestedTable';
import TableHead from '@/app/(admin)/tables/static/components/TableHead';
import TableCaption from '@/app/(admin)/tables/static/components/TableCaption';
const Page = () => {
  return <Container fluid>
      <PageTitle title="Static Tables" subtitle="Display structured data using simple, responsive Bootstrap tables without dynamic interactivity or JS dependencies." badge={{
      title: 'Bootstrap Tables',
      icon: LuTable
    }} />

      <Row className="justify-content-center">
        <Col cols={12}>
          <BasicTable />
          <CustomTable />
          <TableVariants />
          <StripedRowTable />
          <StripedColumnTable />
          <HoverableRowsTable />
          <ActiveRowTable />
          <BorderedTable />
          <BorderlessTable />
          <SmallTable />
          <TableGroupDividers />
          <NestedTable />
          <TableHead />
          <TableCaption />
        </Col>
      </Row>
    </Container>;
};
export default Page;