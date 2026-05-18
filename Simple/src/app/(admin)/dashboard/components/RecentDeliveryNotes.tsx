'use client';

import { Card, CardBody, CardFooter, CardHeader, CardTitle, Col, Row, Table, Pagination, Badge } from 'react-bootstrap';
import { TbCircleFilled, TbChevronLeft, TbChevronRight } from 'react-icons/tb';
import { LuFileText, LuTruck } from 'react-icons/lu';
import Link from 'next/link';
import type { RecentDeliveryNote } from '@/services/dashboardStatsService';

const fmt = (d: string) =>
  new Date(d).toLocaleDateString('en-ZA', { day: '2-digit', month: 'short', year: 'numeric' });

const getStatusColor = (s: string | null): string => {
  switch (s?.toUpperCase()) {
    case 'AVAILABLE':  return 'success';
    case 'SIGNED':     return 'primary';
    case 'COMPLETED':  return 'success';
    case 'PENDING':    return 'warning';
    case 'CANCELLED':  return 'danger';
    default:           return 'secondary';
  }
};

const RecentDeliveryNotes = ({ notes, total }: { notes: RecentDeliveryNote[]; total: number }) => (
  <Card>
    <CardHeader className="justify-content-between align-items-center border-dashed">
      <CardTitle as="h4" className="mb-0">Recent Delivery Notes</CardTitle>
      <div className="d-flex gap-2">
        <Link href="/delivery-notes" className="btn btn-primary btn-sm">
          <LuFileText className="me-1" /> View All
        </Link>
      </div>
    </CardHeader>

    <CardBody className="p-0">
      <Table responsive hover size="sm" className="table-custom table-centered table-sm table-nowrap mb-0">
        <thead className="table-light">
          <tr>
            <th>Delivery No</th>
            <th>Customer</th>
            <th>Invoice No</th>
            <th>Shipment No</th>
            <th>PO No</th>
            <th>Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {notes.length === 0 ? (
            <tr>
              <td colSpan={7} className="text-center py-4 text-muted">No delivery notes found</td>
            </tr>
          ) : notes.map((note) => (
            <tr key={note.deliveryNo}>
              <td>
                <div className="d-flex align-items-center gap-2">
                  <div
                    className="avatar avatar-sm rounded-circle text-bg-primary d-flex align-items-center justify-content-center flex-shrink-0"
                    style={{ width: 32, height: 32 }}
                  >
                    <LuTruck size={14} color="#fff" />
                  </div>
                  <Link href="/delivery-notes" className="text-body fw-semibold">
                    {note.deliveryNo}
                  </Link>
                </div>
              </td>
              <td>
                <span className="fw-normal">{note.customerName ?? '-'}</span>
              </td>
              <td>{note.invoiceNo ?? '-'}</td>
              <td>{note.shipmentNo ?? '-'}</td>
              <td>{note.purchaseOrderNo ?? '-'}</td>
              <td>{fmt(note.createdAt)}</td>
              <td>
                <Badge bg={getStatusColor(note.status)} className="d-inline-flex align-items-center gap-1">
                  <TbCircleFilled style={{ fontSize: '0.5rem' }} />
                  {note.status ?? '-'}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </CardBody>

    <CardFooter className="border-0">
      <Row className="align-items-center justify-content-between text-center text-sm-start">
        <Col className="col-sm">
          <div className="text-muted">
            Showing <span className="fw-semibold">1</span> to{' '}
            <span className="fw-semibold">{notes.length}</span> of{' '}
            <span className="fw-semibold">{total}</span> Delivery Notes
          </div>
        </Col>
        <Col className="col-sm-auto mt-3 mt-sm-0">
          <Pagination size="sm" className="pagination-boxed mb-0 justify-content-center">
            <Pagination.Prev><TbChevronLeft /></Pagination.Prev>
            <Pagination.Item active>{1}</Pagination.Item>
            <Pagination.Next><TbChevronRight /></Pagination.Next>
          </Pagination>
        </Col>
      </Row>
    </CardFooter>
  </Card>
);

export default RecentDeliveryNotes;
