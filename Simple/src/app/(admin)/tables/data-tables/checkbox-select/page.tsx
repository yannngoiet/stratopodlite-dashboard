'use client';

import ComponentCard from '@/components/ComponentCard';
import PageTitle from '@/components/PageTitle';
import { Col, Container, Row } from 'react-bootstrap';
import DataTable from 'datatables.net-react';
import ReactDOMServer from 'react-dom/server';
import { TbChevronLeft, TbChevronRight, TbChevronsLeft, TbChevronsRight } from 'react-icons/tb';
import { tableData } from '@/app/(admin)/tables/data-tables/data';
import { currency } from '@/helpers';
import { useEffect, useRef } from 'react';
import { LuSquareCheck } from 'react-icons/lu';
import useDataTables from '@/hooks/useDatatable';
import Loader from '@/components/Loader';
const columns = [{
  data: null,
  orderable: false,
  className: 'select-checkbox text-start',
  render: function () {
    return '';
  }
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
}, {
  data: 'rating',
  render: data => {
    return `${data}★`;
  }
}, {
  data: 'status',
  render: data => {
    const badgeClass = data === 'Bullish' ? 'success' : 'danger';
    return `<span class="badge badge-label badge-soft-${badgeClass}">${data}</span>`;
  }
}];
const Example = () => {
  const isDataTablesReady = useDataTables();
  const tableRef = useRef(null);
  const selectAllRef = useRef(null);
  useEffect(() => {
    if (!isDataTablesReady || !tableRef.current) return;
    const dt = tableRef.current.dt();
    dt?.on('select deselect', function () {
      const totalRows = dt.rows({
        search: 'applied'
      }).count();
      const selectedRows = dt.rows({
        selected: true,
        search: 'applied'
      }).count();
      if (selectAllRef.current) {
        selectAllRef.current.checked = selectedRows === totalRows;
        selectAllRef.current.indeterminate = selectedRows > 0 && selectedRows < totalRows;
      }
    });
    if (selectAllRef.current) {
      selectAllRef.current.addEventListener('change', () => {
        if (selectAllRef.current?.checked) {
          dt?.rows({
            search: 'applied'
          }).select();
        } else {
          dt?.rows().deselect();
        }
      });
    }
  }, [isDataTablesReady]);
  if (!isDataTablesReady) return <Loader />;
  return <ComponentCard title="Example">
      <DataTable ref={tableRef} data={tableData.body} columns={columns} options={{
      select: {
        style: 'multi',
        selector: 'td:first-child'
      },
      order: [[1, 'asc']],
      responsive: true,
      columnDefs: [{
        targets: 0,
        orderable: false,
        className: 'select-checkbox'
      }],
      language: {
        paginate: {
          first: ReactDOMServer.renderToStaticMarkup(<TbChevronsLeft className="fs-lg" />),
          previous: ReactDOMServer.renderToStaticMarkup(<TbChevronLeft className="fs-lg" />),
          next: ReactDOMServer.renderToStaticMarkup(<TbChevronRight className="fs-lg" />),
          last: ReactDOMServer.renderToStaticMarkup(<TbChevronsRight className="fs-lg" />)
        }
      }
    }} className="table table-striped dt-responsive dt-select-checkbox align-middle mb-0">
        <thead className="thead-sm text-uppercase fs-xxs">
          <tr>
            <th className="fs-sm">
              <input ref={selectAllRef} type="checkbox" className="form-check-input" />
            </th>
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
      <PageTitle title="Checkbox Selection" subtitle="Enable row selection using checkboxes for bulk actions, form submissions, or item management within DataTables." badge={{
      title: 'Multi-Select',
      icon: LuSquareCheck
    }} />

      <Row className="justify-content-center">
        <Col cols={12}>
          <Example />
        </Col>
      </Row>
    </Container>;
};
export default Page;