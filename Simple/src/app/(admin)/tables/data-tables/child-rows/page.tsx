'use client';

import ComponentCard from '@/components/ComponentCard';
import PageTitle from '@/components/PageTitle';
import { useEffect, useRef } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import DataTable from 'datatables.net-react';
import ReactDOMServer from 'react-dom/server';
import { TbChevronLeft, TbChevronRight, TbChevronsLeft, TbChevronsRight } from 'react-icons/tb';
import { currency } from '@/helpers';
import { LuLayoutList } from 'react-icons/lu';
import useDataTables from '@/hooks/useDatatable';
import Loader from '@/components/Loader';
const columns = [{
  className: 'dt-control dt-child-rows-btn',
  orderable: false,
  data: null,
  defaultContent: '<i class="ti ti-square-rounded-plus-filled text-primary align-middle fs-22"></i>'
}, {
  data: 'company'
}, {
  data: 'symbol'
}, {
  data: 'price',
  render: data => {
    return `${currency}${data}`;
  },
  className: 'text-start'
}, {
  data: 'change',
  render: data => {
    return `${data}%`;
  },
  className: 'text-start'
}, {
  data: 'volume',
  className: 'text-start'
}, {
  data: 'marketCap',
  render: data => {
    return `${currency}${data}`;
  }
}];
const formatRowDetails = d => {
  return `
    <div class="row align-items-center">
      <div class="col-md-4">
        <h5 class="fs-base mb-1">Rating:</h5>
        <div>${d.rating}</div>
      </div>
      <div class="col-md-4">
        <h5 class="fs-base mb-1">Status:</h5>
        <span class="badge badge-label ${d.status === 'Bullish' ? 'badge-soft-success' : 'badge-soft-danger'}">${d.status}</span>
      </div>
      <div class="col-md-4">
        <h5 class="fs-base mb-1">Extra info:</h5>
        <div>And any further details here (images etc)...</div>
      </div>
    </div>
  `;
};
const Example = () => {
  const isDataTablesReady = useDataTables();
  const tableRef = useRef(null);
  useEffect(() => {
    if (!tableRef.current) return;
    const table = tableRef.current.dt();
    const initHandler = () => {
      table?.on('click', 'td.dt-child-rows-btn', function (e) {
        const tr = e.target.closest('tr');
        if (tr) {
          const row = table.row(tr);
          if (row.child.isShown()) {
            row.child.hide();
            tr.classList.remove('shown');
          } else {
            row.child(formatRowDetails(row.data())).show();
            tr.classList.add('shown');
          }
        }
      });
    };
    table?.on('init', initHandler);
    return () => {
      table?.off('init', initHandler);
    };
  }, [isDataTablesReady]);
  if (!isDataTablesReady) return <Loader />;
  return <ComponentCard title="Example">
      <DataTable ref={tableRef} ajax="/data/datatables.json" columns={columns} options={{
      order: [[1, 'asc']],
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
            <th></th>
            <th>Company</th>
            <th>Symbol</th>
            <th>Price</th>
            <th>Change</th>
            <th>Volume</th>
            <th>Market Cap</th>
          </tr>
        </thead>
      </DataTable>
    </ComponentCard>;
};
const Page = () => {
  return <Container fluid>
      <PageTitle title="Child Rows" subtitle="Display additional row details with expandable child rows in DataTables for a cleaner and more informative layout." badge={{
      title: 'Expandable Rows',
      icon: LuLayoutList
    }} />

      <Row className="justify-content-center">
        <Col cols={12}>
          <Example />
        </Col>
      </Row>
    </Container>;
};
export default Page;