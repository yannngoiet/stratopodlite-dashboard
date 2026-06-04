'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from '@tanstack/react-table'
import { Container, Form, Button, Row, Col, Badge } from 'react-bootstrap'
import { LuSearch, LuRefreshCw, LuTruck } from 'react-icons/lu'
import shipmentService, { type Shipment } from '@/services/shipmentService'

const NAVY = '#2c3e50'

const formatDate = (val: string | null) =>
  val ? new Date(val).toLocaleString('en-ZA', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  }) : '—'

const formatDateOnly = (val: string | null) =>
  val ? new Date(val).toLocaleDateString('en-ZA') : '—'

export default function ShipmentReportPage() {
  const [data, setData]           = useState<Shipment[]>([])
  const [loading, setLoading]     = useState(false)
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [page, setPage]           = useState(1)
  const pageSize                  = 10

  const [shipmentNo, setShipmentNo] = useState('')
  const [statusId, setStatusId]     = useState('')

  const fetchData = useCallback(async (currentPage: number, sNo: string, sId: string) => {
    setLoading(true)
    try {
      const result = await shipmentService.getAll({
        shipmentNo: sNo || undefined,
        statusId:   sId ? Number(sId) : undefined,
        page:       currentPage,
        pageSize,
      })
      setData(result.items)
      setTotalCount(result.totalCount)
      setTotalPages(result.totalPages || 1)
    } catch (err) {
      console.error(err)
      setData([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData(1, '', '') }, [fetchData])

  const handleSearch = () => {
    setPage(1)
    fetchData(1, shipmentNo, statusId)
  }

  const handleReset = () => {
    setShipmentNo('')
    setStatusId('')
    setPage(1)
    fetchData(1, '', '')
  }

  const handlePageChange = (p: number) => {
    setPage(p)
    fetchData(p, shipmentNo, statusId)
  }

  const columns: ColumnDef<Shipment>[] = [
    {
      header: '#',
      size: 50,
      cell: ({ row }) => (
        <span style={{ color: '#888', fontSize: 12 }}>
          {(page - 1) * pageSize + row.index + 1}
        </span>
      )
    },
    {
      accessorKey: 'shipmentNo',
      header: 'Shipment No',
      cell: ({ row }) => (
        <span style={{ fontWeight: 600, color: NAVY }}>{row.original.shipmentNo}</span>
      )
    },
    {
      accessorKey: 'plantId',
      header: 'Plant',
      cell: ({ row }) => row.original.plantId ?? '—'
    },
    {
      accessorKey: 'driverName',
      header: 'Driver',
      cell: ({ row }) => row.original.driverName ?? '—'
    },
    {
      accessorKey: 'vehicleReg',
      header: 'Vehicle',
      cell: ({ row }) => row.original.vehicleReg
        ? <span style={{ fontWeight: 600 }}>{row.original.vehicleReg}</span>
        : <span className="text-muted">—</span>
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const s = row.original.status
        if (!s) return <span className="text-muted">—</span>
        const bg = s === 'Completed' ? 'success'
          : s === 'In Progress'     ? 'primary'
          : s === 'Pending'         ? 'warning'
          : s === 'Cancelled'       ? 'danger'
          : 'secondary'
        return <Badge bg={bg} style={{ fontSize: 11 }}>{s}</Badge>
      }
    },
    {
      accessorKey: 'assignedExecutionDate',
      header: 'Exec. Date',
      cell: ({ row }) => formatDateOnly(row.original.assignedExecutionDate)
    },
    {
      accessorKey: 'deliveryNotesCount',
      header: 'Deliveries',
      cell: ({ row }) => (
        <Badge bg="info" style={{ fontSize: 11 }}>
          {row.original.deliveryNotesCount}
        </Badge>
      )
    },
    {
      accessorKey: 'createdAt',
      header: 'Created',
      cell: ({ row }) => (
        <span style={{ fontSize: 12 }}>{formatDate(row.original.createdAt)}</span>
      )
    }
  ]

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: totalPages,
  })

  const start = totalCount === 0 ? 0 : (page - 1) * pageSize + 1
  const end   = Math.min(page * pageSize, totalCount)

  return (
    <Container fluid className="py-3">
      <div className="card shadow-sm">
        <div className="card-header d-flex justify-content-between align-items-center py-2"
          style={{ background: NAVY }}>
          <h6 className="mb-0 fw-semibold d-flex align-items-center gap-2" style={{ color: '#fff' }}>
            <LuTruck size={16} /> Shipments
          </h6>
        </div>

        <div className="card-body p-3">
          {/* Filters */}
          <Row className="g-2 mb-3 align-items-center">
            <Col xs={12} md={4}>
              <Form.Control size="sm" type="text" placeholder="Search shipment no..."
                value={shipmentNo}
                onChange={e => setShipmentNo(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()} />
            </Col>
            <Col xs={12} md={3}>
              <Form.Select size="sm" value={statusId}
                onChange={e => setStatusId(e.target.value)}>
                <option value="">All Statuses</option>
                <option value="1">Pending</option>
                <option value="2">Assigned</option>
                <option value="3">In Progress</option>
                <option value="4">Completed</option>
                <option value="5">Cancelled</option>
              </Form.Select>
            </Col>
            <Col xs={12} md={3} className="d-flex gap-2">
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
            <table className="table table-bordered table-striped table-hover table-sm align-middle mb-0"
              style={{ fontSize: 13 }}>
              <thead>
                {table.getHeaderGroups().map(hg => (
                  <tr key={hg.id}>
                    {hg.headers.map(h => (
                      <th key={h.id} className="py-2 px-3 text-uppercase"
                        style={{ background: NAVY, color: '#fff', fontSize: '0.72rem', fontWeight: 600 }}>
                        {flexRender(h.column.columnDef.header, h.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody style={{ fontSize: '0.85rem' }}>
                {loading ? (
                  <tr>
                    <td colSpan={columns.length} className="text-center py-5">
                      <div className="spinner-border text-primary" role="status" />
                    </td>
                  </tr>
                ) : table.getRowModel().rows.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length} className="text-center py-4 text-muted">
                      No shipments found
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
              {totalCount > 0 ? `Showing ${start} to ${end} of ${totalCount} entries` : 'No entries found'}
            </small>
            <div className="d-flex gap-1">
              <Button variant="outline-secondary" size="sm"
                disabled={page === 1 || loading}
                onClick={() => handlePageChange(1)}>«</Button>
              <Button variant="outline-secondary" size="sm"
                disabled={page === 1 || loading}
                onClick={() => handlePageChange(page - 1)}>‹</Button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const p = Math.max(1, page - 2) + i
                if (p > totalPages) return null
                return (
                  <Button key={p} size="sm"
                    variant={p === page ? 'primary' : 'outline-secondary'}
                    onClick={() => handlePageChange(p)}>{p}</Button>
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
        </div>
      </div>
    </Container>
  )
}
