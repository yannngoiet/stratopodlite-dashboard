'use client'

import { useState, useMemo, useEffect, useCallback, Fragment } from 'react'
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
import { Badge, Container, Form, Modal } from 'react-bootstrap'
import { ArrowUp, ArrowDown, ArrowUpDown, Search, RotateCcw } from 'lucide-react'
import { LuPencil, LuTrash2, LuChevronDown, LuChevronRight, LuPlus, LuDownload } from 'react-icons/lu'
import { Button } from '@/components/ui/button'
import * as XLSX from 'xlsx'
import vehicleService, { type Vehicle } from '@/services/vehicleService'
import { getCompanyId } from '@/helpers/config'

const formatDate = (val: string) =>
  new Date(val).toLocaleString('en-ZA', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })

const SortHeader = ({ column, label }: { column: any; label: string }) => (
  <button className="dash-sort-btn-dark"
    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
    {label}
    {column.getIsSorted() === 'asc'  ? <ArrowUp size={12} /> :
     column.getIsSorted() === 'desc' ? <ArrowDown size={12} /> :
     <ArrowUpDown size={12} className="dash-sort-icon-neutral" />}
  </button>
)

export default function VehiclesPage() {
  const [vehicles, setVehicles]         = useState<Vehicle[]>([])
  const [loading, setLoading]           = useState(false)
  const [sorting, setSorting]           = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [expanded, setExpanded]         = useState<ExpandedState>({})
  const [pagination, setPagination]     = useState({ pageIndex: 0, pageSize: 10 })
  const [showModal, setShowModal]       = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [editingVehicle, setEditingVehicle]   = useState<Vehicle | null>(null)
  const [deletingVehicle, setDeletingVehicle] = useState<Vehicle | null>(null)
  const [saving, setSaving]             = useState(false)
  const [formData, setFormData]         = useState({
    vehicleReg: '', trailerReg: '', vehicleType: '', isActive: true,
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

  const resetForm = () => setFormData({ vehicleReg: '', trailerReg: '', vehicleType: '', isActive: true })

  const handleCreate = async () => {
    if (!formData.vehicleReg.trim()) return
    setSaving(true)
    try {
      await vehicleService.create(companyId, {
        vehicleReg:  formData.vehicleReg,
        trailerReg:  formData.trailerReg  || null,
        vehicleType: formData.vehicleType || null,
        isActive:    formData.isActive,
      })
      await loadVehicles(); setShowModal(false); resetForm()
    } catch (error) { console.error(error) }
    finally { setSaving(false) }
  }

  const handleUpdate = async () => {
    if (!editingVehicle || !formData.vehicleReg.trim()) return
    setSaving(true)
    try {
      await vehicleService.update(companyId, editingVehicle.id, {
        vehicleReg:  formData.vehicleReg,
        trailerReg:  formData.trailerReg  || null,
        vehicleType: formData.vehicleType || null,
        isActive:    formData.isActive,
      })
      await loadVehicles(); setShowModal(false); setEditingVehicle(null); resetForm()
    } catch (error) { console.error(error) }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!deletingVehicle) return
    setSaving(true)
    try {
      await vehicleService.delete(companyId, deletingVehicle.id)
      await loadVehicles(); setShowDeleteModal(false); setDeletingVehicle(null)
    } catch (error) { console.error(error) }
    finally { setSaving(false) }
  }

  const handleExportExcel = () => {
    const rows = vehicles.map((v, i) => ({
      '#':               i + 1,
      'Vehicle Reg':     v.vehicleReg,
      'Trailer Reg':     v.trailerReg     ?? '—',
      'Vehicle Type':    v.vehicleType    ?? '—',
      'Assigned Driver': v.currentDriverName ?? '—',
      'Status':          v.isActive ? 'Active' : 'Inactive',
      'Created':         formatDate(v.createdAt),
    }))
    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Vehicles')
    XLSX.writeFile(wb, `Vehicles_${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  const columns = useMemo<ColumnDef<Vehicle>[]>(() => [
    {
      id: 'index', header: '#', size: 50,
      cell: ({ row }) => <span className="dash-cell-muted">{row.index + 1}</span>,
    },
    {
      id: 'expander', header: () => null, size: 40,
      cell: ({ row }) => (
        <button className="btn-ghost" onClick={() => row.toggleExpanded()}>
          {row.getIsExpanded() ? <LuChevronDown size={14} /> : <LuChevronRight size={14} />}
        </button>
      ),
    },
    {
      accessorKey: 'vehicleReg',
      header: ({ column }) => <SortHeader column={column} label="Vehicle Reg" />,
      cell: ({ row }) => <span className="dash-text-navy">{row.original.vehicleReg}</span>,
    },
    {
      accessorKey: 'trailerReg',
      header: ({ column }) => <SortHeader column={column} label="Trailer Reg" />,
      cell: ({ row }) => <span className="dash-cell-muted">{row.original.trailerReg || '—'}</span>,
    },
    {
      accessorKey: 'vehicleType',
      header: ({ column }) => <SortHeader column={column} label="Vehicle Type" />,
      cell: ({ row }) => <span className="dash-cell-muted">{row.original.vehicleType || '—'}</span>,
    },
    {
      id: 'assignedDriver',
      header: ({ column }) => <SortHeader column={column} label="Assigned Driver" />,
      cell: ({ row }) => row.original.currentDriverName
        ? <span style={{ color: '#16a34a', fontWeight: 600 }}>{row.original.currentDriverName}</span>
        : <span className="dash-cell-muted">—</span>,
    },
    {
      accessorKey: 'isActive',
      header: ({ column }) => <SortHeader column={column} label="Status" />,
      cell: ({ row }) => (
        <Badge bg={row.original.isActive ? 'warning' : 'danger'}
          style={{ color: row.original.isActive ? '#856404' : '#fff', borderRadius: 20, padding: '3px 10px' }}>
          {row.original.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      id: 'actions', header: 'Actions',
      cell: ({ row }) => (
        <div className="flex gap-1">
          <Button size="sm" variant="outline" className="rounded-md px-2 !border-slate-300"
            onClick={() => {
              setEditingVehicle(row.original)
              setFormData({
                vehicleReg:  row.original.vehicleReg,
                trailerReg:  row.original.trailerReg  || '',
                vehicleType: row.original.vehicleType || '',
                isActive:    row.original.isActive,
              })
              setShowModal(true)
            }}>
            <LuPencil size={11} />
          </Button>
          <Button size="sm" variant="outline" className="rounded-md px-2 btn-outline-red"
            onClick={() => { setDeletingVehicle(row.original); setShowDeleteModal(true) }}>
            <LuTrash2 size={11} />
          </Button>
        </div>
      ),
    },
  ], [])

  const table = useReactTable({
    data: vehicles, columns,
    state:                 { sorting, columnFilters, globalFilter, expanded, pagination },
    enableExpanding:       true,
    onSortingChange:       setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange:  setGlobalFilter,
    onExpandedChange:      setExpanded,
    onPaginationChange:    setPagination,
    getCoreRowModel:       getCoreRowModel(),
    getFilteredRowModel:   getFilteredRowModel(),
    getSortedRowModel:     getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getExpandedRowModel:   getExpandedRowModel(),
    getRowCanExpand:       () => true,
  })

  const start = table.getFilteredRowModel().rows.length === 0 ? 0 : pagination.pageIndex * pagination.pageSize + 1
  const end   = Math.min((pagination.pageIndex + 1) * pagination.pageSize, table.getFilteredRowModel().rows.length)

  return (
    <Container fluid className="py-3">
      <div className="card shadow-sm">
        <div className="card-header d-flex justify-content-between align-items-center py-2">
          <h6 className="mb-0 fw-semibold">
            Vehicles ({table.getFilteredRowModel().rows.length} total)
          </h6>
          <Button size="sm" onClick={() => { setEditingVehicle(null); resetForm(); setShowModal(true) }}
            className="flex items-center gap-1.5 btn-navy rounded-md">
            <LuPlus size={13} /> Add Vehicle
          </Button>
        </div>

        <div className="card-body p-3">
          {/* Filters */}
          <div className="dash-filter-bar mb-3">
            <input placeholder="Search by registration or type..." value={globalFilter}
              onChange={e => setGlobalFilter(e.target.value)}
              className="dash-filter-input" />
            <select className="dash-filter-input"
              onChange={e => table.getColumn('vehicleType')?.setFilterValue(e.target.value || undefined)}>
              <option value="">All Types</option>
              <option value="Truck">Truck</option>
              <option value="Tipper">Tipper</option>
              <option value="Flatbed">Flatbed</option>
              <option value="Tanker">Tanker</option>
              <option value="Van">Van</option>
            </select>
            <select className="dash-filter-input"
              onChange={e => {
                if (e.target.value === '') table.getColumn('isActive')?.setFilterValue(undefined)
                else table.getColumn('isActive')?.setFilterValue(e.target.value === 'true')
              }}>
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
            <Button size="sm" onClick={() => table.setPageIndex(0)}
              className="flex items-center gap-1.5 whitespace-nowrap btn-blue rounded-md">
              <Search size={13} /> Search
            </Button>
            <Button size="sm" variant="outline" onClick={() => {
              setGlobalFilter('')
              table.getColumn('isActive')?.setFilterValue(undefined)
              table.getColumn('vehicleType')?.setFilterValue(undefined)
              table.setPageIndex(0)
            }} className="flex items-center gap-1.5 whitespace-nowrap rounded-md">
              <RotateCcw size={13} /> Reset
            </Button>
          </div>

          {/* Table */}
          <div className="table-responsive">
            <table className="table table-hover table-sm align-middle mb-0">
              <thead className="dash-thead-dark">
                {table.getHeaderGroups().map(hg => (
                  <tr key={hg.id}>
                    {hg.headers.map(h => (
                      <th key={h.id} className="py-2 px-3 text-uppercase">
                        {flexRender(h.column.columnDef.header, h.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody style={{ fontSize: '0.85rem' }}>
                {loading ? (
                  <tr><td colSpan={columns.length} className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </td></tr>
                ) : table.getRowModel().rows.length === 0 ? (
                  <tr><td colSpan={columns.length} className="text-center py-4 text-muted">
                    No vehicles found
                  </td></tr>
                ) : (
                  table.getRowModel().rows.map(row => (
                    <Fragment key={row.id}>
                      <tr>
                        {row.getVisibleCells().map(cell => (
                          <td key={cell.id} className="py-2 px-3">
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        ))}
                      </tr>
                      {row.getIsExpanded() && (
                        <tr style={{ background: '#f8fafc' }}>
                          <td colSpan={row.getVisibleCells().length} className="px-4 py-3">
                            <div className="row g-3" style={{ fontSize: 12 }}>
                              <div className="col-6 col-md-3">
                                <div className="dash-cell-muted mb-1">Vehicle Reg</div>
                                <div className="dash-text-navy fw-medium">{row.original.vehicleReg}</div>
                              </div>
                              <div className="col-6 col-md-3">
                                <div className="dash-cell-muted mb-1">Trailer Reg</div>
                                <div>{row.original.trailerReg || '—'}</div>
                              </div>
                              <div className="col-6 col-md-3">
                                <div className="dash-cell-muted mb-1">Vehicle Type</div>
                                <div>{row.original.vehicleType || '—'}</div>
                              </div>
                              <div className="col-6 col-md-3">
                                <div className="dash-cell-muted mb-1">Assigned Driver</div>
                                <div style={{ color: row.original.currentDriverName ? '#16a34a' : '#6b7a99', fontWeight: row.original.currentDriverName ? 600 : 400 }}>
                                  {row.original.currentDriverName || '—'}
                                </div>
                              </div>
                              <div className="col-6 col-md-3">
                                <div className="dash-cell-muted mb-1">Created</div>
                                <div>{formatDate(row.original.createdAt)}</div>
                              </div>
                              <div className="col-6 col-md-3">
                                <div className="dash-cell-muted mb-1">Last Updated</div>
                                <div>{formatDate(row.original.updatedAt)}</div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="d-flex justify-content-between align-items-center mt-3 flex-wrap gap-2">
            <small className="text-muted">
              Showing {start} to {end} of {table.getFilteredRowModel().rows.length} entries
            </small>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" disabled={!table.getCanPreviousPage()} onClick={() => table.setPageIndex(0)} className="rounded-md px-2">«</Button>
              <Button variant="outline" size="sm" disabled={!table.getCanPreviousPage()} onClick={() => table.previousPage()} className="rounded-md px-2">‹</Button>
              {Array.from({ length: Math.min(5, table.getPageCount()) }, (_, i) => {
                const pageNum = Math.max(0, pagination.pageIndex - 2) + i
                if (pageNum >= table.getPageCount()) return null
                return (
                  <Button key={pageNum} size="sm"
                    className={`rounded-md px-2 ${pageNum === pagination.pageIndex ? 'btn-navy' : ''}`}
                    variant={pageNum === pagination.pageIndex ? 'default' : 'outline'}
                    onClick={() => table.setPageIndex(pageNum)}>
                    {pageNum + 1}
                  </Button>
                )
              })}
              <Button variant="outline" size="sm" disabled={!table.getCanNextPage()} onClick={() => table.nextPage()} className="rounded-md px-2">›</Button>
              <Button variant="outline" size="sm" disabled={!table.getCanNextPage()} onClick={() => table.setPageIndex(table.getPageCount() - 1)} className="rounded-md px-2">»</Button>
            </div>
          </div>

          {/* Export */}
          <div className="flex justify-center mt-3 gap-2">
            <Button size="sm" className="flex items-center gap-1.5 btn-sky rounded-md">
              <LuDownload size={13} /> Download Report
            </Button>
            <Button size="sm" onClick={handleExportExcel} disabled={vehicles.length === 0}
              className="flex items-center gap-1.5 btn-green rounded-md">
              <LuDownload size={13} /> Export to Excel
            </Button>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal show={showModal} onHide={() => { setShowModal(false); setEditingVehicle(null); resetForm() }} centered>
        <Modal.Header closeButton className="modal-header-dark">
          <Modal.Title style={{ fontSize: 15, fontWeight: 600 }}>
            {editingVehicle ? 'Edit Vehicle' : 'Add Vehicle'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="field-label">Vehicle Registration <span className="text-red-500">*</span></label>
              <input className="dash-filter-input" placeholder="ABC 123 GP"
                value={formData.vehicleReg}
                onChange={e => setFormData({ ...formData, vehicleReg: e.target.value.toUpperCase() })} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="field-label">Trailer Registration</label>
              <input className="dash-filter-input" placeholder="TRL 456 GP"
                value={formData.trailerReg}
                onChange={e => setFormData({ ...formData, trailerReg: e.target.value.toUpperCase() })} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="field-label">Vehicle Type</label>
              <select className="dash-filter-input" value={formData.vehicleType}
                onChange={e => setFormData({ ...formData, vehicleType: e.target.value })}>
                <option value="">Select type...</option>
                <option value="Truck">Truck</option>
                <option value="Tipper">Tipper</option>
                <option value="Flatbed">Flatbed</option>
                <option value="Tanker">Tanker</option>
                <option value="Van">Van</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <Form.Check type="switch" id="active-vehicle-switch"
                checked={formData.isActive}
                onChange={e => setFormData({ ...formData, isActive: e.target.checked })} />
              <label htmlFor="active-vehicle-switch" className="field-label mb-0" style={{ cursor: 'pointer' }}>
                Active Vehicle
              </label>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer style={{ borderTop: '1px solid #dde3f0', padding: '0.75rem 1.25rem' }}>
          <Button size="sm" variant="outline" className="rounded-md px-4"
            onClick={() => { setShowModal(false); setEditingVehicle(null); resetForm() }}>
            Cancel
          </Button>
          <Button size="sm" disabled={saving} className="rounded-md px-4 btn-navy"
            onClick={editingVehicle ? handleUpdate : handleCreate}>
            {saving ? 'Saving...' : editingVehicle ? 'Update' : 'Create'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered size="sm">
        <Modal.Header closeButton className="modal-header-dark">
          <Modal.Title style={{ fontSize: 15, fontWeight: 600 }}>Delete Vehicle</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          Are you sure you want to delete <strong>{deletingVehicle?.vehicleReg}</strong>?
        </Modal.Body>
        <Modal.Footer style={{ borderTop: '1px solid #dde3f0', padding: '0.75rem 1.25rem' }}>
          <Button size="sm" variant="outline" className="rounded-md px-4"
            onClick={() => setShowDeleteModal(false)}>Cancel</Button>
          <Button size="sm" disabled={saving} className="rounded-md px-4 btn-outline-red"
            onClick={handleDelete}>
            {saving ? 'Deleting...' : 'Delete'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  )
}
