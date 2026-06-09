'use client';

import { useState, useEffect, useCallback } from 'react';
import { flexRender, getCoreRowModel, useReactTable, type ColumnDef } from '@tanstack/react-table';
import { Container, Form, Button, Row, Col, Modal, Badge } from 'react-bootstrap';
import { LuSearch, LuRefreshCw, LuEye, LuClipboardList } from 'react-icons/lu';
import tripSheetService, { type TripSheet, type TripSheetItem } from '@/services/tripSheetService';
import { getCompanyId } from '@/helpers/config';

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: '1', label: 'Pending' },
  { value: '2', label: 'In Progress' },
  { value: '3', label: 'Completed' },
  { value: '4', label: 'Cancelled' },
]

const statusBadgeVariant = (status: string) => {
  const s = status.toLowerCase()
  if (s.includes('complet')) return 'success'
  if (s.includes('progress') || s.includes('arrived')) return 'info'
  if (s.includes('cancel')) return 'danger'
  if (s.includes('pending')) return 'warning'
  return 'secondary'
}

const formatDate = (val: string | null) =>
  val ? new Date(val).toLocaleString() : '—'

const Page = () => {
  const [allData, setAllData] = useState<TripSheet[]>([])
  const [data, setData] = useState<TripSheet[]>([])
  const [loading, setLoading] = useState(false)
  const [totalCount, setTotalCount] = useState(0)
  const [page, setPage] = useState(1)
  const pageSize = 15
  const [totalPages, setTotalPages] = useState(0)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedItem, setSelectedItem] = useState<TripSheet | null>(null)
  const [showModal, setShowModal] = useState(false)

  const applyFilters = (all: TripSheet[], s: string, status: string, currentPage: number) => {
    let result = [...all]
    if (s) {
      const lower = s.toLowerCase()
      result = result.filter(d =>
        d.shipmentNo.toLowerCase().includes(lower) ||
        (d.driverName ?? '').toLowerCase().includes(lower) ||
        (d.dispatchControllerName ?? '').toLowerCase().includes(lower)
      )
    }
    if (status) result = result.filter(d => d.statusId === parseInt(status))
    setTotalCount(result.length)
    setTotalPages(Math.ceil(result.length / pageSize) || 1)
    const start = (currentPage - 1) * pageSize
    setData(result.slice(start, start + pageSize))
  }

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const companyId = getCompanyId()
      const result = await tripSheetService.getAll(companyId)
      setAllData(result)
      applyFilters(result, '', '', 1)
    } catch (err) {
      console.error('Fetch error:', err)
      setData([])
      setAllData([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const handleSearch = () => { setPage(1); applyFilters(allData, search, statusFilter, 1) }
  const handleReset = () => {
    setSearch('')
    setStatusFilter('')
    setPage(1)
    applyFilters(allData, '', '', 1)
  }
  const handlePageChange = (p: number) => { setPage(p); applyFilters(allData, search, statusFilter, p) }

  const openView = (item: TripSheet) => {
    setSelectedItem(item)
    setShowModal(true)
  }

  const itemColumns: ColumnDef<TripSheetItem>[] = [
    { header: '#', cell: ({ row }) => row.index + 1, size: 40 },
    { accessorKey: 'itemCode', header: 'Item Code' },
    { accessorKey: 'description', header: 'Description', cell: ({ getValue }) => getValue() ?? '—' },
    { accessorKey: 'uom', header: 'UOM', cell: ({ getValue }) => getValue() ?? '—' },
    { accessorKey: 'qtyReturned', header: 'Qty Returned' },
    { accessorKey: 'reason', header: 'Reason', cell: ({ getValue }) => getValue() ?? '—' },
  ]

  const itemTable = useReactTable({
    data: selectedItem?.items ?? [],
    columns: itemColumns,
    getCoreRowModel: getCoreRowModel(),
  })

  const columns: ColumnDef<TripSheet>[] = [
    { header: '#', cell: ({ row }) => (page - 1) * pageSize + row.index + 1, size: 50 },
    { accessorKey: 'shipmentNo', header: 'Shipment No' },
    {
      accessorKey: 'driverName', header: 'Driver',
      cell: ({ getValue }) => getValue() ?? '—'
    },
    {
      accessorKey: 'dispatchControllerName', header: 'Dispatch Controller',
      cell: ({ getValue }) => getValue() ?? '—'
    },
    {
      accessorKey: 'statusId', header: 'Status',
      cell: ({ row }) => (
        <Badge bg={statusBadgeVariant(row.original.status)}>
          {row.original.status}
        </Badge>
      )
    },
    {
      accessorKey: 'arrivedAt', header: 'Arrived At',
      cell: ({ getValue }) => formatDate(getValue() as string | null)
    },
    {
      accessorKey: 'completedAt', header: 'Completed At',
      cell: ({ getValue }) => formatDate(getValue() as string | null)
    },
    {
      accessorKey: 'itemCount', header: 'Items',
      cell: ({ getValue }) => (
        <span className="badge bg-secondary">{getValue() as number}</span>
      )
    },
    {
      accessorKey: 'createdAt', header: 'Created At',
      cell: ({ getValue }) => formatDate(getValue() as string)
    },
    {
      id: 'actions', header: 'Actions',
      cell: ({ row }) => (
        <Button size="sm" variant="outline-primary" onClick={() => openView(row.original)}>
          <LuEye className="me-1" />View
        </Button>
      )
    }
  ]

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
          <h6 className="mb-0 fw-semibold d-flex align-items-center gap-2">
            <LuClipboardList /> Trip Sheets ({totalCount})
          </h6>
          <Button size="sm" variant="outline-secondary" onClick={fetchData} disabled={loading}>
            <LuRefreshCw className="me-1" />Refresh
          </Button>
        </div>

        <div className="card-body p-3">
          <Row className="g-2 mb-3 align-items-center">
            <Col xs={12} md={5}>
              <Form.Control
                size="sm"
                type="text"
                placeholder="Search by shipment no, driver, or dispatch controller..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
              />
            </Col>
            <Col xs={12} md={3}>
              <Form.Select
                size="sm"
                value={statusFilter}
                onChange={e => { setStatusFilter(e.target.value); setPage(1); applyFilters(allData, search, e.target.value, 1) }}
              >
                {STATUS_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </Form.Select>
            </Col>
            <Col xs={12} md={4} className="d-flex gap-2">
              <Button size="sm" variant="primary" onClick={handleSearch} disabled={loading}>
                <LuSearch className="me-1" />Search
              </Button>
              <Button size="sm" variant="secondary" onClick={handleReset} disabled={loading}>
                <LuRefreshCw className="me-1" />Reset
              </Button>
            </Col>
          </Row>

          <div className="table-responsive">
            <table className="table table-bordered table-striped table-hover table-sm align-middle mb-0">
              <thead style={{ backgroundColor: '#2c3e50', color: '#fff', fontSize: '0.75rem' }}>
                {table.getHeaderGroups().map(hg => (
                  <tr key={hg.id}>
                    {hg.headers.map(h => (
                      <th key={h.id} className="py-2 px-3 text-uppercase" style={{ color: '#fff', backgroundColor: '#2c3e50' }}>
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
                      No trip sheets found
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

          <div className="d-flex justify-content-between align-items-center mt-3 flex-wrap gap-2">
            <small className="text-muted">
              {totalCount > 0
                ? `Showing ${start} to ${end} of ${totalCount} entries`
                : 'No entries found'}
            </small>
            <div className="d-flex gap-1">
              <Button variant="outline-secondary" size="sm" disabled={page === 1 || loading} onClick={() => handlePageChange(1)}>«</Button>
              <Button variant="outline-secondary" size="sm" disabled={page === 1 || loading} onClick={() => handlePageChange(page - 1)}>‹</Button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const p = Math.max(1, page - 2) + i
                if (p > totalPages) return null
                return (
                  <Button key={p} size="sm"
                    variant={p === page ? 'primary' : 'outline-secondary'}
                    onClick={() => handlePageChange(p)}>{p}</Button>
                )
              })}
              <Button variant="outline-secondary" size="sm" disabled={page >= totalPages || loading} onClick={() => handlePageChange(page + 1)}>›</Button>
              <Button variant="outline-secondary" size="sm" disabled={page >= totalPages || loading} onClick={() => handlePageChange(totalPages)}>»</Button>
            </div>
          </div>
        </div>
      </div>

      {/* View Details Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title className="d-flex align-items-center gap-2">
            <LuClipboardList />
            Trip Sheet — {selectedItem?.shipmentNo}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedItem && (
            <>
              <Row className="g-3 mb-4">
                <Col md={6}>
                  <small className="text-muted d-block">Shipment No</small>
                  <strong>{selectedItem.shipmentNo}</strong>
                </Col>
                <Col md={6}>
                  <small className="text-muted d-block">Status</small>
                  <Badge bg={statusBadgeVariant(selectedItem.status)}>{selectedItem.status}</Badge>
                </Col>
                <Col md={6}>
                  <small className="text-muted d-block">Driver</small>
                  <span>{selectedItem.driverName ?? '—'}</span>
                </Col>
                <Col md={6}>
                  <small className="text-muted d-block">Dispatch Controller</small>
                  <span>{selectedItem.dispatchControllerName ?? '—'}</span>
                </Col>
                <Col md={6}>
                  <small className="text-muted d-block">Arrived At</small>
                  <span>{formatDate(selectedItem.arrivedAt)}</span>
                </Col>
                <Col md={6}>
                  <small className="text-muted d-block">Completed At</small>
                  <span>{formatDate(selectedItem.completedAt)}</span>
                </Col>
                <Col md={6}>
                  <small className="text-muted d-block">Created At</small>
                  <span>{formatDate(selectedItem.createdAt)}</span>
                </Col>
              </Row>

              <h6 className="fw-semibold mb-2">Return Items ({selectedItem.items.length})</h6>
              <div className="table-responsive">
                <table className="table table-bordered table-sm align-middle mb-0">
                  <thead style={{ backgroundColor: '#2c3e50', color: '#fff', fontSize: '0.75rem' }}>
                    {itemTable.getHeaderGroups().map(hg => (
                      <tr key={hg.id}>
                        {hg.headers.map(h => (
                          <th key={h.id} className="py-2 px-3 text-uppercase" style={{ color: '#fff', backgroundColor: '#2c3e50' }}>
                            {flexRender(h.column.columnDef.header, h.getContext())}
                          </th>
                        ))}
                      </tr>
                    ))}
                  </thead>
                  <tbody style={{ fontSize: '0.85rem' }}>
                    {itemTable.getRowModel().rows.length === 0 ? (
                      <tr>
                        <td colSpan={itemColumns.length} className="text-center py-3 text-muted">
                          No items returned
                        </td>
                      </tr>
                    ) : (
                      itemTable.getRowModel().rows.map(row => (
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
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" size="sm" onClick={() => setShowModal(false)}>Close</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  )
}

export default Page
