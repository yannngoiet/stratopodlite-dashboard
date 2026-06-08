'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from '@tanstack/react-table';
import { Container, Form, Button, Row, Col, Badge, Spinner } from 'react-bootstrap';
import { LuSearch, LuRefreshCw, LuDownload, LuEye } from 'react-icons/lu';
import deliveryNoteService, { type DeliveryNoteListItem } from '@/services/deliveryNoteService';


const getStatusVariant = (status: string | null) => {
  switch (status) {
    case 'Pending':              return 'warning'
    case 'InProgress':           return 'primary'
    case 'Arrived':              return 'info'
    case 'Offloading':           return 'info'
    case 'OffloadingComplete':   return 'info'
    case 'Departed':             return 'primary'
    case 'Completed':            return 'success'
    case 'BackAtDepot':          return 'success'
    case 'EndOfDay':             return 'secondary'
    case 'Cancelled':            return 'danger'
    default:                     return 'secondary'
  }
}

const formatDate = (date: string | null) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('en-ZA', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

const Page = () => {

  const [data, setData]             = useState<DeliveryNoteListItem[]>([])
  const [loading, setLoading]       = useState(false)
  const [totalCount, setTotalCount] = useState(0)
  const [page, setPage]             = useState(1)
  const [pageSize]                  = useState(10)
  const [totalPages, setTotalPages] = useState(0)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  const [deliveryNo, setDeliveryNo]     = useState('')
  const [customerName, setCustomerName] = useState('')
  const [dateFrom, setDateFrom]         = useState('')
  const [dateTo, setDateTo]             = useState('')

  // ── Download PDF ───────────────────────────────────────────────────────────
  const handleDownloadPdf = async (dn: string) => {
    setDownloadingId(dn)
    try {
      const blob = await deliveryNoteService.downloadPdf(dn)
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = url
      a.download = `DeliveryNote_${dn}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error(err)
      alert('An error occurred while generating the PDF.')
    } finally {
      setDownloadingId(null)
    }
  }

  // ── Columns ────────────────────────────────────────────────────────────────
  const columns: ColumnDef<DeliveryNoteListItem>[] = [
    {
      header: '#',
      cell: ({ row }) => row.index + 1,
      size: 50
    },
    { accessorKey: 'deliveryNo',      header: 'Delivery Nr' },
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
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const dn = row.original.deliveryNo
        const isDownloading = downloadingId === dn

        if (row.original.status !== 'Completed') return null

        return (
          <div className="d-flex gap-1">
            <Button
              size="sm"
              variant="outline-primary"
              title="View Details"
              onClick={() => alert(`Preview: ${dn}`)}>
              <LuEye size={14} />
            </Button>
            <Button
              size="sm"
              variant="outline-success"
              title="Download PDF"
              disabled={isDownloading}
              onClick={() => handleDownloadPdf(dn)}>
              {isDownloading
                ? <Spinner size="sm" />
                : <LuDownload size={14} />}
            </Button>
          </div>
        )
      }
    }
  ]

  // ── Fetch data ─────────────────────────────────────────────────────────────
  const fetchData = useCallback(async (
    currentPage       = 1,
    currentDeliveryNo = '',
    currentCustomer   = '',
    currentDateFrom   = '',
    currentDateTo     = ''
  ) => {
    setLoading(true)
    try {
      const result = await deliveryNoteService.getAll({
        page:         currentPage,
        pageSize,
        deliveryNo:   currentDeliveryNo || undefined,
        customerName: currentCustomer   || undefined,
        dateFrom:     currentDateFrom   || undefined,
        dateTo:       currentDateTo     || undefined,
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

  useEffect(() => { fetchData() }, [fetchData])

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
  const end   = Math.min(page * pageSize, totalCount)

  return (
    <Container fluid className="py-3">
      <div className="card shadow-sm">
        <div className="card-header d-flex justify-content-between align-items-center py-2">
          <h6 className="mb-0 fw-semibold">
            Delivery Notes ({totalCount} total)
          </h6>
        </div>

        <div className="card-body p-3">
          {/* Filters */}
          <Row className="g-2 mb-3 align-items-center">
            <Col xs={12} md={3}>
              <Form.Control size="sm" type="text" placeholder="Delivery Nr"
                value={deliveryNo}
                onChange={e => setDeliveryNo(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()} />
            </Col>
            <Col xs={12} md={3}>
              <Form.Control size="sm" type="text" placeholder="Customer Name"
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()} />
            </Col>
            <Col xs={6} md={2}>
              <Form.Control size="sm" type="date" value={dateFrom}
                onChange={e => setDateFrom(e.target.value)} />
            </Col>
            <Col xs={6} md={2}>
              <Form.Control size="sm" type="date" value={dateTo}
                onChange={e => setDateTo(e.target.value)} />
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
              <thead style={{ backgroundColor: '#2c3e50' }}>
                {table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                      <th key={header.id} className="py-2 px-3 text-uppercase"
                        style={{ color: '#fff', fontWeight: 600, fontSize: '0.75rem', backgroundColor: '#2c3e50' }}>
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

          {/* Pagination */}
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
                  <Button key={pageNum} size="sm"
                    variant={pageNum === page ? 'primary' : 'outline-secondary'}
                    onClick={() => handlePageChange(pageNum)}>
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

          {/* Export */}
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