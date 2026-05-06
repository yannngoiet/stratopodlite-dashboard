'use client';

import ComponentCard from '@/components/ComponentCard';
import PageTitle from '@/components/PageTitle';
import { Col, Container, Row } from 'react-bootstrap';
import DataTable from 'datatables.net-react';
import ReactDOMServer from 'react-dom/server';
import { TbChevronLeft, TbChevronRight, TbChevronsLeft, TbChevronsRight } from 'react-icons/tb';
import { columns, tableData } from '@/app/(admin)/tables/data-tables/data';
import { LuDatabase } from 'react-icons/lu';
import useDataTables from '@/hooks/useDatatable';
import Loader from '@/components/Loader';
const Example = () => {
  const isDataTablesReady = useDataTables();
  if (!isDataTablesReady) return <Loader />;
  return <ComponentCard title="Example">
      <DataTable ajax="/data/datatables.json" columns={columns} options={{
      processing: true,
      responsive: true,
      language: {
        paginate: {
          first: ReactDOMServer.renderToStaticMarkup(<TbChevronsLeft className="fs-lg" />),
          previous: ReactDOMServer.renderToStaticMarkup(<TbChevronLeft className="fs-lg" />),
          next: ReactDOMServer.renderToStaticMarkup(<TbChevronRight className="fs-lg" />),
          last: ReactDOMServer.renderToStaticMarkup(<TbChevronsRight className="fs-lg" />)
        }
      }
    }} className="table table-striped dt-responsive align-middle mb-0">
        <thead className="thead-sm text-uppercase fs-xxs">
          <tr>
            {tableData.header.map((label, idx) => <th key={idx}>{label}</th>)}
          </tr>
        </thead>
      </DataTable>
    </ComponentCard>;
};
const Page = () => {
  return <Container fluid>
      <PageTitle title="Ajax DataTables" subtitle="Load table data asynchronously using Ajax with DataTables for faster performance and seamless server-side integration." badge={{
      title: 'Dynamic Loading',
      icon: LuDatabase
    }} />

      <Row className="justify-content-center">
        <Col cols={12}>
          <Example />
        </Col>
      </Row>
    </Container>;
};
export default Page;