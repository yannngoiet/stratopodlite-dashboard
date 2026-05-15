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
import { Badge, Button, Container, Form, Modal } from 'react-bootstrap'
import { LuPencil, LuTrash2, LuCarFront, LuChevronDown, LuChevronRight, LuPlus } from 'react-icons/lu'
import vehicleService, { type Vehicle } from '@/services/vehicleService'
import { getCompanyId } from '@/helpers/config'

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
      id: 'expander',
      header: () => null,
      size: 40,
      cell: ({ row }) => (
        <button
          className="btn btn-sm btn-link p-0 text-secondary"
          onClick={() => row.toggleExpanded()}
        >
          {row.getIsExpanded() ? <LuChevronDown size={14} /> : <LuChevronRight size={14} />}
        </button>
      ),
    },
    { accessorKey: 'id', header: 'ID', size: 60 },
    { accessorKey: 'vehicleReg', header: 'Vehicle Reg' },
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
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => (
        <Badge bg={row.original.isActive ? 'success' : 'danger'}>
          {row.original.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="d-flex gap-1">
          <Button
            size="sm"
            variant="outline-primary"
            onClick={() => {
              setEditingVehicle(row.original)
              setFormData({
                vehicleReg: row.original.vehicleReg,
                trailerReg: row.original.trailerReg || '',
                vehicleType: row.original.vehicleType || '',
                isActive: row.original.isActive,
              })
              setShowModal(true)
            }}
          >
            <LuPencil size={12} />
          </Button>
          <Button
            size="sm"
            variant="outline-danger"
            onClick={() => { setDeletingVehicle(row.original); setShowDeleteModal(true) }}
          >
            <LuTrash2 size={12} />
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

  return (
    <Container fluid className="py-3">

      {/* Header */}
      <div className="mb-4">
        <h4 className="fw-bold d-flex align-items-center gap-2 mb-1">
          <LuCarFront size={22} /> Fleet Management
        </h4>
        <p className="text-muted small mb-0">Manage your vehicle fleet</p>
      </div>

      {/* Stats */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <div className="card shadow-sm text-center py-3">
            <div className="text-muted small">Total Vehicles</div>
            <div className="fs-3 fw-bold">{totalVehicles}</div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card shadow-sm text-center py-3">
            <div className="text-muted small">Active</div>
            <div className="fs-3 fw-bold text-success">{activeVehicles}</div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card shadow-sm text-center py-3">
            <div className="text-muted small">Inactive</div>
            <div className="fs-3 fw-bold text-danger">{totalVehicles - activeVehicles}</div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card shadow-sm text-center py-3">
            <div className="text-muted small">Selected</div>
            <div className="fs-3 fw-bold text-primary">{Object.keys(rowSelection).length}</div>
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="card shadow-sm">
        <div className="card-header d-flex justify-content-between align-items-center py-2">
          <h6 className="mb-0 fw-semibold">
            Vehicles ({table.getFilteredRowModel().rows.length})
          </h6>
          <Button
            size="sm"
            variant="primary"
            onClick={() => { setEditingVehicle(null); resetForm(); setShowModal(true) }}
          >
            <LuPlus className="me-1" />Add Vehicle
          </Button>
        </div>
        <div className="card-body p-3">

          {/* Search */}
          <div className="mb-3">
            <Form.Control
              size="sm"
              type="text"
              placeholder="Search vehicles..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              style={{ maxWidth: 320 }}
            />
          </div>

          {/* Table */}
          <div className="table-responsive">
            <table className="table table-bordered table-striped table-hover table-sm align-middle mb-0">
              <thead style={{ backgroundColor: '#2c3e50', color: '#fff', fontSize: '0.75rem' }}>
                {table.getHeaderGroups().map(hg => (
                  <tr key={hg.id}>
                    {hg.headers.map(h => (
                      <th
                        key={h.id}
                        className="py-2 px-3 text-uppercase"
                        style={{ cursor: h.column.getCanSort() ? 'pointer' : 'default' }}
                        onClick={h.column.getToggleSortingHandler()}
                      >
                        <div className="d-flex align-items-center gap-1">
                          {flexRender(h.column.columnDef.header, h.getContext())}
                          {h.column.getCanSort() && (
                            <span style={{ opacity: 0.6, fontSize: 10 }}>
                              {h.column.getIsSorted() === 'asc' ? '↑'
                                : h.column.getIsSorted() === 'desc' ? '↓'
                                : '↕'}
                            </span>
                          )}
                        </div>
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
                              <div className="col-6 col-md-4">
                                <div className="text-muted">Vehicle Registration</div>
                                <div className="fw-medium">{row.original.vehicleReg}</div>
                              </div>
                              <div className="col-6 col-md-4">
                                <div className="text-muted">Trailer Registration</div>
                                <div className="fw-medium">{row.original.trailerReg || '—'}</div>
                              </div>
                              <div className="col-6 col-md-4">
                                <div className="text-muted">Vehicle Type</div>
                                <div className="fw-medium">{row.original.vehicleType || '—'}</div>
                              </div>
                              <div className="col-6 col-md-4">
                                <div className="text-muted">Created</div>
                                <div className="fw-medium">{new Date(row.original.createdAt).toLocaleString('en-ZA')}</div>
                              </div>
                              <div className="col-6 col-md-4">
                                <div className="text-muted">Last Updated</div>
                                <div className="fw-medium">{new Date(row.original.updatedAt).toLocaleString('en-ZA')}</div>
                              </div>
                              <div className="col-6 col-md-4">
                                <div className="text-muted">Status</div>
                                <Badge bg={row.original.isActive ? 'success' : 'danger'}>
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

          {/* Pagination */}
          <div className="d-flex justify-content-between align-items-center mt-3 flex-wrap gap-2">
            <small className="text-muted">
              Showing {table.getRowModel().rows.length} of {table.getFilteredRowModel().rows.length} vehicles
            </small>
            <div className="d-flex align-items-center gap-2">
              <Form.Select
                size="sm"
                style={{ width: 100 }}
                value={pagination.pageSize}
                onChange={(e) => setPagination(p => ({ ...p, pageSize: Number(e.target.value), pageIndex: 0 }))}
              >
                {[10, 20, 50].map(size => (
                  <option key={size} value={size}>{size} / page</option>
                ))}
              </Form.Select>
              <div className="d-flex gap-1">
                <Button variant="outline-secondary" size="sm"
                  disabled={!table.getCanPreviousPage()}
                  onClick={() => table.setPageIndex(0)}>«</Button>
                <Button variant="outline-secondary" size="sm"
                  disabled={!table.getCanPreviousPage()}
                  onClick={() => table.previousPage()}>‹</Button>
                <span className="d-flex align-items-center px-2 small">
                  Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() || 1}
                </span>
                <Button variant="outline-secondary" size="sm"
                  disabled={!table.getCanNextPage()}
                  onClick={() => table.nextPage()}>›</Button>
                <Button variant="outline-secondary" size="sm"
                  disabled={!table.getCanNextPage()}
                  onClick={() => table.setPageIndex(table.getPageCount() - 1)}>»</Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal show={showModal} onHide={() => { setShowModal(false); setEditingVehicle(null); resetForm() }} centered>
        <Modal.Header closeButton>
          <Modal.Title>{editingVehicle ? 'Edit Vehicle' : 'Add Vehicle'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Vehicle Registration <span className="text-danger">*</span></Form.Label>
            <Form.Control
              size="sm"
              type="text"
              placeholder="ABC 123 GP"
              value={formData.vehicleReg}
              onChange={(e) => setFormData({ ...formData, vehicleReg: e.target.value.toUpperCase() })}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Trailer Registration</Form.Label>
            <Form.Control
              size="sm"
              type="text"
              placeholder="TRL 456 GP"
              value={formData.trailerReg}
              onChange={(e) => setFormData({ ...formData, trailerReg: e.target.value.toUpperCase() })}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Vehicle Type</Form.Label>
            <Form.Select
              size="sm"
              value={formData.vehicleType}
              onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
            >
              <option value="">Select type...</option>
              <option value="Truck">Truck</option>
              <option value="Tipper">Tipper</option>
              <option value="Flatbed">Flatbed</option>
              <option value="Tanker">Tanker</option>
              <option value="Van">Van</option>
              <option value="Other">Other</option>
            </Form.Select>
          </Form.Group>
          <Form.Check
            type="switch"
            label="Active Vehicle"
            checked={formData.isActive}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" size="sm"
            onClick={() => { setShowModal(false); setEditingVehicle(null); resetForm() }}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            disabled={saving}
            onClick={editingVehicle ? handleUpdate : handleCreate}
          >
            {saving ? 'Saving...' : editingVehicle ? 'Update' : 'Create'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered size="sm">
        <Modal.Header closeButton>
          <Modal.Title>Delete Vehicle</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete <strong>{deletingVehicle?.vehicleReg}</strong>?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" size="sm" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
          <Button variant="danger" size="sm" disabled={saving} onClick={handleDelete}>
            {saving ? 'Deleting...' : 'Delete'}
          </Button>
        </Modal.Footer>
      </Modal>

    </Container>
  )
}