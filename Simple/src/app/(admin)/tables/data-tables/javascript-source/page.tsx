'use client';

import ComponentCard from '@/components/ComponentCard';
import PageTitle from '@/components/PageTitle';
import { Col, Container, Row } from 'react-bootstrap';
import DataTable from 'datatables.net-react';
import ReactDOMServer from 'react-dom/server';
import { TbChevronLeft, TbChevronRight, TbChevronsLeft, TbChevronsRight } from 'react-icons/tb';
import { dataSet } from '@/app/(admin)/tables/data-tables/javascript-source/data';
import { currency } from '@/helpers';
import { LuCode } from 'react-icons/lu';
import useDataTables from '@/hooks/useDatatable';
import Loader from '@/components/Loader';
const columns = [{
  title: 'company'
}, {
  title: 'symbol'
}, {
  title: 'price',
  render: data => {
    return `${currency}${data}`;
  },
  className: 'text-start'
}, {
  title: 'change',
  className: 'text-start'
}, {
  title: 'volume',
  className: 'text-start'
}, {
  title: 'market cap',
  render: data => {
    return `${currency}${data}`;
  }
}, {
  title: 'rating'
}, {
  title: 'status',
  render: data => {
    const badgeClass = data === 'Bullish' ? 'success' : 'danger';
    return `<span class="badge badge-label badge-soft-${badgeClass}">${data}</span>`;
  }
}];
const Example = () => {
  const isDataTablesReady = useDataTables();
  if (!isDataTablesReady) return <Loader />;
  return <ComponentCard title="Example">
      <DataTable columns={columns} options={{
      data: dataSet,
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
            <th>Company</th>
            <th>Symbol</th>
            <th>Price</th>
            <th>Change</th>
            <th>Volume</th>
            <th>Market Cap</th>
            <th>Rating</th>
            <th>Status</th>
          </tr>
        </thead>
      </DataTable>
    </ComponentCard>;
};
const Page = () => {
  return <Container fluid>
      <PageTitle title="JavaScript DataTables" subtitle="Populate DataTables directly from JavaScript arrays or objects for full client-side control and flexibility." badge={{
      title: 'Client-Side Data',
      icon: LuCode
    }} />

      <Row className="justify-content-center">
        <Col cols={12}>
          <Example />
        </Col>
      </Row>
    </Container>;
};
export default Page;