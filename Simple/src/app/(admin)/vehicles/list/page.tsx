'use client'

import React, { useState, useMemo, useEffect, useCallback } from 'react'
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getExpandedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  type ExpandedState,
} from '@tanstack/react-table'
import { Badge, Button, Col, Container, Form, Modal, Row } from 'react-bootstrap'
import { LuPencil, LuTrash2, LuCarFront, LuChevronDown, LuChevronRight, LuPlus, LuDownload } from 'react-icons/lu'
import vehicleService, { type Vehicle } from '@/services/vehicleService'
import { getCompanyId } from '@/helpers/config'

const NAVY = '#2c3e50'

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(false)
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [rowSelection, setRowSelection] = useState({})
  const [expanded, setExpanded] = useState<ExpandedState>({})
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 })
  const [showModal, setShowModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null)
  const [deletingVehicle, setDeletingVehicle] = useState<Vehicle | null>(null)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    vehicleReg: '',
    trailerReg: '',
    vehicleType: '',
    isActive: true,
  })

  const companyId = getCompanyId()

  const loadVehicles = useCallback(async () => {
    setLoading(true)
    try {
      const data = await vehicleService.getAll(companyId)
      setVehicles(data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }, [companyId])

  useEffect(() => { loadVehicles() }, [loadVehicles])

  const resetForm = () => {
    setFormData({ vehicleReg: '', trailerReg: '', vehicleType: '', isActive: true })
  }

  const handleCreate = async () => {
    if (!formData.vehicleReg.trim()) return
    setSaving(true)
    try {
      await vehicleService.create(companyId, {
        vehicleReg: formData.vehicleReg,
        trailerReg: formData.trailerReg || null,
        vehicleType: formData.vehicleType || null,
        isActive: formData.isActive,
      })
      await loadVehicles()
      setShowModal(false)
      resetForm()
    } catch (error) {
      console.error(error)
    } finally {
      setSaving(false)
    }
  }

  const handleUpdate = async () => {
    if (!editingVehicle || !formData.vehicleReg.trim()) return
    setSaving(true)
    try {
      await vehicleService.update(companyId, editingVehicle.id, {
        vehicleReg: formData.vehicleReg,
        trailerReg: formData.trailerReg || null,
        vehicleType: formData.vehicleType || null,
        isActive: formData.isActive,
      })
      await loadVehicles()
      setShowModal(false)
      setEditingVehicle(null)
      resetForm()
    } catch (error) {
      console.error(error)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deletingVehicle) return
    setSaving(true)
    try {
      await vehicleService.delete(companyId, deletingVehicle.id)
      await loadVehicles()
      setShowDeleteModal(false)
      setDeletingVehicle(null)
    } catch (error) {
      console.error(error)
    } finally {
      setSaving(false)
    }
  }

  const columns = useMemo<ColumnDef<Vehicle>[]>(() => [
    {
      id: 'index',
      header: '#',
      size: 50,
      cell: ({ row }) => (
        <span style={{ color: '#888', fontSize: 12 }}>{row.index + 1}</span>
      ),
    },
    {
      id: 'expander',
      header: () => null,
      size: 40,
      cell: ({ row }) => (
        <button
          className="btn btn-sm btn-link p-0 text-secondary"
          onClick={() => row.toggleExpanded()}>
          {row.getIsExpanded()
            ? <LuChevronDown size={14} />
            : <LuChevronRight size={14} />}
        </button>
      ),
    },
    {
      accessorKey: 'vehicleReg',
      header: 'Vehicle Reg',
      cell: ({ row }) => (
        <span style={{ fontWeight: 600, color: NAVY }}>{row.original.vehicleReg}</span>
      )
    },
    {
      accessorKey: 'trailerReg',
      header: 'Trailer Reg',
      cell: ({ row }) => row.original.trailerReg || '—',
    },
    {
      accessorKey: 'vehicleType',
      header: 'Vehicle Type',
      cell: ({ row }) => row.original.vehicleType || '—',
    },
    {
      id: 'assignedDriver',
      header: 'Assigned Driver',
      cell: ({ row }) => row.original.currentDriverName
        ? <span style={{ color: '#28a745', fontWeight: 600, fontSize: 12 }}>
            {row.original.currentDriverName}
          </span>
        : <span className="text-muted">—</span>
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => (
        <Badge style={{
          fontSize: 11,
          background: row.original.isActive ? '#fff3cd' : '#f8d7da',
          color: row.original.isActive ? '#856404' : '#842029',
          border: `1px solid ${row.original.isActive ? '#ffc107' : '#f5c2c7'}`,
          borderRadius: 20,
          padding: '3px 10px'
        }}>
          {row.original.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="d-flex gap-1">
          <Button size="sm" variant="outline-secondary"
            style={{ padding: '2px 6px', fontSize: 11 }}
            onClick={() => {
              setEditingVehicle(row.original)
              setFormData({
                vehicleReg: row.original.vehicleReg,
                trailerReg: row.original.trailerReg || '',
                vehicleType: row.original.vehicleType || '',
                isActive: row.original.isActive,
              })
              setShowModal(true)
            }}>
            <LuPencil size={11} />
          </Button>
          <Button size="sm" variant="outline-danger"
            style={{ padding: '2px 6px', fontSize: 11 }}
            onClick={() => { setDeletingVehicle(row.original); setShowDeleteModal(true) }}>
            <LuTrash2 size={11} />
          </Button>
        </div>
      ),
    },
  ], [])

  const table = useReactTable({
    data: vehicles,
    columns,
    state: { sorting, columnFilters, globalFilter, rowSelection, expanded, pagination },
    enableRowSelection: true,
    enableExpanding: true,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    onExpandedChange: setExpanded,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getRowCanExpand: () => true,
  })

  const totalVehicles = vehicles.length
  const activeVehicles = vehicles.filter(v => v.isActive).length
  const start = totalVehicles === 0 ? 0 : pagination.pageIndex * pagination.pageSize + 1
  const end = Math.min((pagination.pageIndex + 1) * pagination.pageSize, table.getFilteredRowModel().rows.length)

  return (
    <Container fluid className="py-3" style={{ fontSize: 13 }}>

      {/* ── Main Card ── */}
      <div className="card shadow-sm">
        <div className="card-header d-flex justify-content-between align-items-center py-2">
          <h6 className="mb-0 fw-semibold">
            Vehicles ({table.getFilteredRowModel().rows.length} total)
          </h6>
          <Button size="sm"
            style={{ background: NAVY, border: 'none', fontSize: 12 }}
            onClick={() => { setEditingVehicle(null); resetForm(); setShowModal(true) }}>
            <LuPlus size={13} className="me-1" />Add Vehicle
          </Button>
        </div>

        <div className="card-body p-3">

          {/* ── Filters row ── */}
          <Row className="g-2 mb-3">
            <Col xs={12} md={4}>
              <Form.Control size="sm" type="text"
                placeholder="Search by registration or type..."
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)} />
            </Col>
            <Col xs={6} md={3}>
              <Form.Select size="sm"
                onChange={(e) => {
                  if (e.target.value === '') table.getColumn('isActive')?.setFilterValue(undefined)
                  else table.getColumn('isActive')?.setFilterValue(e.target.value === 'true')
                }}>
                <option value="">All Status</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </Form.Select>
            </Col>
            <Col xs={6} md={3}>
              <Form.Select size="sm"
                onChange={(e) => {
                  table.getColumn('vehicleType')?.setFilterValue(e.target.value || undefined)
                }}>
                <option value="">All Types</option>
                <option value="Truck">Truck</option>
                <option value="Tipper">Tipper</option>
                <option value="Flatbed">Flatbed</option>
                <option value="Tanker">Tanker</option>
                <option value="Van">Van</option>
              </Form.Select>
            </Col>
          </Row>

          {/* ── Table ── */}
          <div className="table-responsive">
            <table className="table table-bordered table-hover table-sm align-middle mb-0"
              style={{ fontSize: 13 }}>
              <thead>
                {table.getHeaderGroups().map(hg => (
                  <tr key={hg.id}>
                    {hg.headers.map(h => (
                      <th key={h.id}
                        className="py-2 px-3 text-uppercase"
                        style={{
                          background: NAVY,
                          color: '#fff',
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          cursor: h.column.getCanSort() ? 'pointer' : 'default',
                          whiteSpace: 'nowrap'
                        }}
                        onClick={h.column.getToggleSortingHandler()}>
                        <div className="d-flex align-items-center gap-1">
                          {flexRender(h.column.columnDef.header, h.getContext())}
                          {h.column.getCanSort() && (
                            <span style={{ opacity: 0.5, fontSize: 10 }}>
                              {h.column.getIsSorted() === 'asc' ? '↑'
                                : h.column.getIsSorted() === 'desc' ? '↓' : '↕'}
                            </span>
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={columns.length} className="text-center py-5">
                      <div className="spinner-border text-primary" role="status" />
                    </td>
                  </tr>
                ) : table.getRowModel().rows.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length} className="text-center py-4 text-muted">
                      No vehicles found
                    </td>
                  </tr>
                ) : (
                  table.getRowModel().rows.map(row => (
                    <React.Fragment key={row.id}>
                      <tr>
                        {row.getVisibleCells().map(cell => (
                          <td key={cell.id} className="py-2 px-3">
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        ))}
                      </tr>
                      {row.getIsExpanded() && (
                        <tr style={{ background: '#f8f9fa' }}>
                          <td colSpan={row.getVisibleCells().length} className="px-4 py-3">
                            <div className="row g-3 small">
                              <div className="col-6 col-md-3">
                                <div className="text-muted" style={{ fontSize: 11 }}>Vehicle Reg</div>
                                <div className="fw-semibold" style={{ color: NAVY }}>
                                  {row.original.vehicleReg}
                                </div>
                              </div>
                              <div className="col-6 col-md-3">
                                <div className="text-muted" style={{ fontSize: 11 }}>Trailer Reg</div>
                                <div className="fw-medium">{row.original.trailerReg || '—'}</div>
                              </div>
                              <div className="col-6 col-md-3">
                                <div className="text-muted" style={{ fontSize: 11 }}>Vehicle Type</div>
                                <div className="fw-medium">{row.original.vehicleType || '—'}</div>
                              </div>
                              <div className="col-6 col-md-3">
                                <div className="text-muted" style={{ fontSize: 11 }}>Assigned Driver</div>
                                <div className="fw-medium" style={{ color: row.original.currentDriverName ? '#28a745' : '#888' }}>
                                  {row.original.currentDriverName || '—'}
                                </div>
                              </div>
                              <div className="col-6 col-md-3">
                                <div className="text-muted" style={{ fontSize: 11 }}>Created</div>
                                <div className="fw-medium">
                                  {new Date(row.original.createdAt).toLocaleString('en-ZA')}
                                </div>
                              </div>
                              <div className="col-6 col-md-3">
                                <div className="text-muted" style={{ fontSize: 11 }}>Last Updated</div>
                                <div className="fw-medium">
                                  {new Date(row.original.updatedAt).toLocaleString('en-ZA')}
                                </div>
                              </div>
                              <div className="col-6 col-md-3">
                                <div className="text-muted" style={{ fontSize: 11 }}>Status</div>
                                <Badge style={{
                                  fontSize: 11,
                                  background: row.original.isActive ? '#fff3cd' : '#f8d7da',
                                  color: row.original.isActive ? '#856404' : '#842029',
                                  border: `1px solid ${row.original.isActive ? '#ffc107' : '#f5c2c7'}`,
                                  borderRadius: 20,
                                  padding: '3px 10px'
                                }}>
                                  {row.original.isActive ? 'Active' : 'Inactive'}
                                </Badge>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* ── Pagination ── */}
          <div className="d-flex justify-content-between align-items-center mt-3 flex-wrap gap-2">
            <small className="text-muted">
              Showing {start} to {end} of {table.getFilteredRowModel().rows.length} entries
            </small>
            <div className="d-flex gap-1">
              <Button variant="outline-secondary" size="sm"
                disabled={!table.getCanPreviousPage()}
                onClick={() => table.setPageIndex(0)}>«</Button>
              <Button variant="outline-secondary" size="sm"
                disabled={!table.getCanPreviousPage()}
                onClick={() => table.previousPage()}>‹</Button>
              {Array.from({ length: Math.min(5, table.getPageCount()) }, (_, i) => {
                const pageNum = Math.max(0, pagination.pageIndex - 2) + i
                if (pageNum >= table.getPageCount()) return null
                return (
                  <Button key={pageNum} size="sm"
                    variant={pageNum === pagination.pageIndex ? 'primary' : 'outline-secondary'}
                    onClick={() => table.setPageIndex(pageNum)}>
                    {pageNum + 1}
                  </Button>
                )
              })}
              <Button variant="outline-secondary" size="sm"
                disabled={!table.getCanNextPage()}
                onClick={() => table.nextPage()}>›</Button>
              <Button variant="outline-secondary" size="sm"
                disabled={!table.getCanNextPage()}
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}>»</Button>
            </div>
          </div>

          {/* ── Export buttons ── */}
          <div className="d-flex justify-content-center mt-3 gap-2">
            <Button size="sm" style={{ background: '#17a2b8', border: 'none', fontSize: 12 }}>
              <LuDownload size={13} className="me-1" />Download Report
            </Button>
            <Button size="sm" style={{ background: '#28a745', border: 'none', fontSize: 12 }}>
              <LuDownload size={13} className="me-1" />Export to Excel
            </Button>
          </div>

        </div>
      </div>

      {/* ── Add/Edit Modal ── */}
      <Modal show={showModal}
        onHide={() => { setShowModal(false); setEditingVehicle(null); resetForm() }}
        centered>
        <Modal.Header closeButton style={{ background: NAVY, color: '#fff' }}>
          <Modal.Title style={{ fontSize: 15 }}>
            {editingVehicle ? 'Edit Vehicle' : 'Add Vehicle'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label style={{ fontSize: 12 }}>
              Vehicle Registration <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control size="sm" type="text" placeholder="ABC 123 GP"
              value={formData.vehicleReg}
              onChange={(e) => setFormData({ ...formData, vehicleReg: e.target.value.toUpperCase() })} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label style={{ fontSize: 12 }}>Trailer Registration</Form.Label>
            <Form.Control size="sm" type="text" placeholder="TRL 456 GP"
              value={formData.trailerReg}
              onChange={(e) => setFormData({ ...formData, trailerReg: e.target.value.toUpperCase() })} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label style={{ fontSize: 12 }}>Vehicle Type</Form.Label>
            <Form.Select size="sm" value={formData.vehicleType}
              onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}>
              <option value="">Select type...</option>
              <option value="Truck">Truck</option>
              <option value="Tipper">Tipper</option>
              <option value="Flatbed">Flatbed</option>
              <option value="Tanker">Tanker</option>
              <option value="Van">Van</option>
              <option value="Other">Other</option>
            </Form.Select>
          </Form.Group>
          <Form.Check type="switch" label="Active Vehicle"
            checked={formData.isActive}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} />
        </Modal.Body>
        <Modal.Footer>
          <Button size="sm" variant="outline-secondary"
            onClick={() => { setShowModal(false); setEditingVehicle(null); resetForm() }}>
            Cancel
          </Button>
          <Button size="sm"
            style={{ background: NAVY, border: 'none' }}
            disabled={saving}
            onClick={editingVehicle ? handleUpdate : handleCreate}>
            {saving ? 'Saving...' : editingVehicle ? 'Update' : 'Create'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ── Delete Modal ── */}
      <Modal show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)} centered size="sm">
        <Modal.Header closeButton style={{ background: NAVY, color: '#fff' }}>
          <Modal.Title style={{ fontSize: 15 }}>Delete Vehicle</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete{' '}
          <strong>{deletingVehicle?.vehicleReg}</strong>?
        </Modal.Body>
        <Modal.Footer>
          <Button size="sm" variant="outline-secondary"
            onClick={() => setShowDeleteModal(false)}>Cancel</Button>
          <Button size="sm" variant="danger" disabled={saving} onClick={handleDelete}>
            {saving ? 'Deleting...' : 'Delete'}
          </Button>
        </Modal.Footer>
      </Modal>

    </Container>
  )
}