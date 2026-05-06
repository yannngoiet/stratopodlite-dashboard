'use client';

import { useMemo } from 'react';
import ComponentCard from '@/components/ComponentCard';
import PageTitle from '@/components/PageTitle';
import { Col, Container, Row } from 'react-bootstrap';
import DataTable from 'datatables.net-react';
import Loader from '@/components/Loader';
import ReactDOMServer from 'react-dom/server';
import { TbChevronLeft, TbChevronRight, TbChevronsLeft, TbChevronsRight } from 'react-icons/tb';
import { LuLayoutTemplate } from 'react-icons/lu';
import useDataTables from '@/hooks/useDatatable';
import arFlag from '@/assets/images/flags/ar.svg';
import auFlag from '@/assets/images/flags/au.svg';
import deFlag from '@/assets/images/flags/de.svg';
import gbFlag from '@/assets/images/flags/gb.svg';
import inFlag from '@/assets/images/flags/in.svg';
import jpFlag from '@/assets/images/flags/jp.svg';
import usFlag from '@/assets/images/flags/us.svg';
const flagMap = {
  Argentina: arFlag.src,
  Gujarat: inFlag.src,
  Germany: deFlag.src,
  London: gbFlag.src,
  'New York': usFlag.src,
  'San Francisco': usFlag.src,
  Sydney: auFlag.src,
  Tokyo: jpFlag.src
};
const Example = () => {
  const isDataTablesReady = useDataTables();
  const columns = useMemo(() => {
    return [{
      data: 'name'
    }, {
      data: 'position',
      render: (data, type) => {
        if (type === 'display') {
          let link = 'https://datatables.net';
          if (data[0] < 'H') {
            link = 'https://cloudtables.com';
          } else if (data[0] < 'S') {
            link = 'https://editor.datatables.net';
          }
          return `<a href="${link}" target="_blank">${data}</a>`;
        }
        return data;
      }
    }, {
      data: 'office',
      render: (data, type) => {
        if (type === 'display') {
          return `
              <span class="flag">
                <img class="avatar-xs rounded me-2" src="${flagMap[data] || ''}" alt="${data}" />
              </span> ${data}
            `;
        }
        return data;
      },
      className: 'f32'
    }, {
      data: 'extn',
      render: (data, type) => {
        return type === 'display' ? `<div class="progress" role="progressbar" style="height:8px">
                <div class="progress-bar" style="width: ${data / 9999 * 100}%"></div>
              </div>` : data;
      }
    }, {
      data: 'start_date'
    }, {
      data: 'salary',
      render: async function (data, type) {
        const dt = (await import('datatables.net')).default;
       const formatter = dt.render.number(',', '.', 2, '$');
      const number = (formatter.display as (data: any) => string)(data);
        if (type === 'display') {
          let color = 'green';
          if (data < 250000) color = 'red';else if (data < 500000) color = 'orange';
          return `<span style="color:${color}">${number}</span>`;
        }
        return number;
      }
    }];
  }, []);
  if (!isDataTablesReady) return <Loader />;
  return <ComponentCard title="Rendering Flags, Links, Progress, and Currency">
      <DataTable ajax="/data/datatables-rendering.json" columns={columns} options={{
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
            <th>Name</th>
            <th>Position</th>
            <th>Office</th>
            <th>Progress</th>
            <th>Start Date</th>
            <th>Salary</th>
          </tr>
        </thead>
      </DataTable>
    </ComponentCard>;
};
const Page = () => {
  return <Container fluid>
      <PageTitle title="Data Rendering" subtitle="Customize how data is displayed using render functions, flags, progress, and conditional formatting." badge={{
      title: 'Custom Output',
      icon: LuLayoutTemplate
    }} />

      <Row className="justify-content-center">
        <Col cols={12}>
          <Example />
        </Col>
      </Row>
    </Container>;
};
export default Page;