'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from '@tanstack/react-table';
import { Container, Form, Button, Row, Col, Badge } from 'react-bootstrap';
import { LuSearch, LuRefreshCw, LuDownload } from 'react-icons/lu';
import deliveryNoteService, { type DeliveryNoteListItem } from '@/services/deliveryNoteService';

const getCompanyId = (): number => {
  if (typeof window === 'undefined') return 0
  const user = localStorage.getItem('user')
  if (user) {
    const parsed = JSON.parse(user)
    return parsed.companyId ?? 0
  }
  return 0
}

const getStatusVariant = (status: string | null) => {
  switch (status) {
    case 'AVAILABLE': return 'success'
    case 'SIGNED': return 'primary'
    case 'PENDING': return 'warning'
    case 'Completed': return 'success'
    case 'Pending': return 'warning'
    default: return 'secondary'
  }
}

const formatDate = (date: string | null) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('en-ZA', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const columns: ColumnDef<DeliveryNoteListItem>[] = [
  {
    header: '#',
    cell: ({ row }) => row.index + 1,
    size: 50
  },
  {
    accessorKey: 'deliveryNo',
    header: 'Delivery Nr'
  },
  {
    accessorKey: 'shipmentNo',
    header: 'Shipment Nr',
    cell: ({ row }) => row.original.shipmentNo ?? '-'
  },
  {
    accessorKey: 'customerName',
    header: 'Customer Name',
    cell: ({ row }) => row.original.customerName ?? '-'
  },
  {
    accessorKey: 'invoiceNo',
    header: 'Invoice Nr',
    cell: ({ row }) => row.original.invoiceNo ?? '-'
  },
  {
    accessorKey: 'purchaseOrderNo',
    header: 'Order Nr',
    cell: ({ row }) => row.original.purchaseOrderNo ?? '-'
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <Badge bg={getStatusVariant(row.original.status)}>
        {row.original.status ?? '-'}
      </Badge>
    )
  },
  {
    accessorKey: 'createdAt',
    header: 'Date Loaded',
    cell: ({ row }) => formatDate(row.original.createdAt)
  },
  {
    accessorKey: 'updatedAt',
    header: 'Last Updated',
    cell: ({ row }) => formatDate(row.original.updatedAt)
  }
]

const Page = () => {
  const [data, setData] = useState<DeliveryNoteListItem[]>([])
  const [loading, setLoading] = useState(false)
  const [totalCount, setTotalCount] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [totalPages, setTotalPages] = useState(0)

  const [deliveryNo, setDeliveryNo] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const fetchData = useCallback(async (
    currentPage = 1,
    currentDeliveryNo = '',
    currentCustomerName = '',
    currentDateFrom = '',
    currentDateTo = ''
  ) => {
    setLoading(true)
    try {
      const companyId = getCompanyId()
      const result = await deliveryNoteService.getAll(companyId, {
        page: currentPage,
        pageSize,
        deliveryNo: currentDeliveryNo,
        customerName: currentCustomerName,
        dateFrom: currentDateFrom,
        dateTo: currentDateTo
      })
      setData(result.items)
      setTotalCount(result.totalCount)
      setTotalPages(result.totalPages)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [pageSize])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleSearch = () => {
    setPage(1)
    fetchData(1, deliveryNo, customerName, dateFrom, dateTo)
  }

  const handleReset = () => {
    setDeliveryNo('')
    setCustomerName('')
    setDateFrom('')
    setDateTo('')
    setPage(1)
    fetchData(1, '', '', '', '')
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    fetchData(newPage, deliveryNo, customerName, dateFrom, dateTo)
  }

  const table = useReactTable({
    data: data ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: totalPages
  })

  const start = totalCount === 0 ? 0 : (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, totalCount)

  return (
    <Container fluid className="py-3">
      <div className="card shadow-sm">
        <div className="card-header d-flex justify-content-between align-items-center py-2">
          <h6 className="mb-0 fw-semibold">
            Top {totalCount} Delivery Notes ordered by Date Loaded
          </h6>
        </div>

        <div className="card-body p-3">
          {/* Filters Row */}
          <Row className="g-2 mb-3 align-items-center">
            <Col xs={12} md={3}>
              <Form.Control
                size="sm"
                type="text"
                placeholder="Delivery Nr"
                value={deliveryNo}
                onChange={e => setDeliveryNo(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
              />
            </Col>
            <Col xs={12} md={3}>
              <Form.Control
                size="sm"
                type="text"
                placeholder="Customer Name"
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
              />
            </Col>
            <Col xs={6} md={2}>
              <Form.Control
                size="sm"
                type="date"
                value={dateFrom}
                onChange={e => setDateFrom(e.target.value)}
              />
            </Col>
            <Col xs={6} md={2}>
              <Form.Control
                size="sm"
                type="date"
                value={dateTo}
                onChange={e => setDateTo(e.target.value)}
              />
            </Col>
            <Col xs={12} md={2} className="d-flex gap-2">
              <Button size="sm" variant="primary" onClick={handleSearch} disabled={loading}>
                <LuSearch className="me-1" />Search
              </Button>
              <Button size="sm" variant="secondary" onClick={handleReset} disabled={loading}>
                <LuRefreshCw className="me-1" />Reset
              </Button>
            </Col>
          </Row>

          {/* Table */}
          <div className="table-responsive">
            <table className="table table-bordered table-striped table-hover table-sm align-middle mb-0">
              <thead style={{ backgroundColor: '#2c3e50', color: '#fff', fontSize: '0.75rem' }}>
                {table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                      <th key={header.id} className="py-2 px-3 text-uppercase">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody style={{ fontSize: '0.85rem' }}>
                {loading ? (
                  <tr>
                    <td colSpan={columns.length} className="text-center py-5">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </td>
                  </tr>
                ) : table.getRowModel().rows.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length} className="text-center py-4 text-muted">
                      No delivery notes found
                    </td>
                  </tr>
                ) : (
                  table.getRowModel().rows.map(row => (
                    <tr key={row.id}>
                      {row.getVisibleCells().map(cell => (
                        <td key={cell.id} className="py-2 px-3">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Row */}
          <div className="d-flex justify-content-between align-items-center mt-3 flex-wrap gap-2">
            <small className="text-muted">
              {totalCount > 0
                ? `Showing ${start} to ${end} of ${totalCount} entries`
                : 'No entries found'}
            </small>
            <div className="d-flex gap-1">
              <Button variant="outline-secondary" size="sm"
                disabled={page === 1 || loading}
                onClick={() => handlePageChange(1)}>«</Button>
              <Button variant="outline-secondary" size="sm"
                disabled={page === 1 || loading}
                onClick={() => handlePageChange(page - 1)}>‹</Button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = Math.max(1, page - 2) + i
                if (pageNum > totalPages) return null
                return (
                  <Button
                    key={pageNum}
                    size="sm"
                    variant={pageNum === page ? 'primary' : 'outline-secondary'}
                    onClick={() => handlePageChange(pageNum)}
                  >
                    {pageNum}
                  </Button>
                )
              })}
              <Button variant="outline-secondary" size="sm"
                disabled={page >= totalPages || loading}
                onClick={() => handlePageChange(page + 1)}>›</Button>
              <Button variant="outline-secondary" size="sm"
                disabled={page >= totalPages || loading}
                onClick={() => handlePageChange(totalPages)}>»</Button>
            </div>
          </div>

          {/* Export Buttons */}
          <div className="d-flex justify-content-center mt-3 gap-2">
            <Button variant="info" size="sm" className="text-white">
              <LuDownload className="me-1" />Download Report
            </Button>
            <Button variant="success" size="sm">
              <LuDownload className="me-1" />Export to Excel
            </Button>
          </div>
        </div>
      </div>
    </Container>
  )
}

export default Page