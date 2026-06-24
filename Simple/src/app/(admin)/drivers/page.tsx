'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
} from '@tanstack/react-table'
import { Badge, Button as RBButton, Container, Form, Modal } from 'react-bootstrap'
import { LuPencil, LuTrash2, LuPlus, LuCarFront, LuSave, LuDownload } from 'react-icons/lu'
import { ArrowUp, ArrowDown, ArrowUpDown, Search, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import * as XLSX from 'xlsx'
import driverService, { type Driver } from '@/services/driverService'
import vehicleService, { type Vehicle } from '@/services/vehicleService'
import { getCompanyId } from '@/helpers/config'

const SortHeader = ({ column, label }: { column: any; label: string }) => (
  <button className="dash-sort-btn-dark"
    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
    {label}
    {column.getIsSorted() === 'asc'  ? <ArrowUp size={12} /> :
     column.getIsSorted() === 'desc' ? <ArrowDown size={12} /> :
     <ArrowUpDown size={12} className="dash-sort-icon-neutral" />}
  </button>
)

const PLANT_OPTIONS = [
  { id: 'P001', name: 'Acme Head Office - JHB' },
  { id: 'P002', name: 'Acme Depot - CPT' },
  { id: 'P003', name: 'Acme Depot - DBN' },
  { id: 'PLANT001', name: 'Johannesburg Warehouse' },
]

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(false)
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 })

  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deletingDriver, setDeletingDriver] = useState<Driver | null>(null)
  const [saving, setSaving] = useState(false)

  const [showFormModal, setShowFormModal] = useState(false)
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null)
  const [driverForm, setDriverForm] = useState({
    empNo: '', firstName: '', lastName: '',
    plantId: 'P001', username: '', password: '',
    licenseNumber: '', licenseExpiryDate: '', isActive: true,
  })

  const [vehicleReg, setVehicleReg] = useState('')
  const [vehicleType, setVehicleType] = useState('')
  const [savingVehicle, setSavingVehicle] = useState(false)
  const [vehicleSearch, setVehicleSearch] = useState('')
  const [showVehicleList, setShowVehicleList] = useState(false)

  const [assigningVehicleId, setAssigningVehicleId] = useState<Record<number, number | null>>({})
  const [savingAssign, setSavingAssign] = useState<number | null>(null)

  const companyId = getCompanyId()

  const loadDrivers = useCallback(async () => {
    setLoading(true)
    try {
      const data = await driverService.getAll()
      setDrivers(data)
    } catch (error) { console.error(error) }
    finally { setLoading(false) }
  }, [])

  const loadVehicles = useCallback(async () => {
    try {
      const data = await vehicleService.getAll(companyId)
      setVehicles(data)
    } catch (error) { console.error(error) }
  }, [companyId])

  useEffect(() => {
    loadDrivers()
    loadVehicles()
  }, [loadDrivers, loadVehicles])

  const getDriverVehicle = (driverId: number) =>
    vehicles.find(v => v.currentDriverId === driverId) ?? null

  const resetDriverForm = () => {
    setDriverForm({
      empNo: '', firstName: '', lastName: '',
      plantId: 'P001', username: '', password: '',
      licenseNumber: '', licenseExpiryDate: '', isActive: true,
    })
    setEditingDriver(null)
  }

  const handleSaveDriver = async () => {
    if (!driverForm.empNo.trim() || !driverForm.firstName.trim() || !driverForm.lastName.trim() || !driverForm.username.trim()) return
    if (!editingDriver && !driverForm.password.trim()) return
    setSaving(true)
    try {
      if (editingDriver) {
        await driverService.update(editingDriver.id, {
          empNo: driverForm.empNo,
          firstName: driverForm.firstName,
          lastName: driverForm.lastName,
          plantId: driverForm.plantId,
          username: driverForm.username || null,
          licenseNumber: driverForm.licenseNumber || null,
          licenseExpiryDate: driverForm.licenseExpiryDate || null,
          isActive: driverForm.isActive,
        })
      } else {
        await driverService.create({
          empNo: driverForm.empNo,
          firstName: driverForm.firstName,
          lastName: driverForm.lastName,
          plantId: driverForm.plantId,
          username: driverForm.username || null,
          password: driverForm.password,
          licenseNumber: driverForm.licenseNumber || null,
          licenseExpiryDate: driverForm.licenseExpiryDate || null,
          isActive: driverForm.isActive,
        })
      }
      await loadDrivers()
      resetDriverForm()
      setShowFormModal(false)
    } catch (error) { console.error(error) }
    finally { setSaving(false) }
  }

  const handleDeleteDriver = async () => {
    if (!deletingDriver) return
    setSaving(true)
    try {
      await driverService.delete(deletingDriver.id)
      await loadDrivers()
      setShowDeleteModal(false)
      setDeletingDriver(null)
    } catch (error) { console.error(error) }
    finally { setSaving(false) }
  }

  const handleAddVehicle = async () => {
    if (!vehicleReg.trim()) return
    setSavingVehicle(true)
    try {
      await vehicleService.create(companyId, {
        vehicleReg: vehicleReg.toUpperCase(),
        trailerReg: null,
        vehicleType: vehicleType || null,
      })
      await loadVehicles()
      setVehicleReg('')
      setVehicleType('')
    } catch (error) { console.error(error) }
    finally { setSavingVehicle(false) }
  }

  const handleDeleteVehicle = async (vehicleId: number) => {
    if (!confirm('Delete this vehicle?')) return
    try {
      await vehicleService.delete(companyId, vehicleId)
      await loadVehicles()
    } catch (error) { console.error(error) }
  }

  const handleAssignVehicle = async (driverId: number) => {
    const newVehicleId = assigningVehicleId[driverId] ?? null
    setSavingAssign(driverId)
    try {
      const current = getDriverVehicle(driverId)
      if (current && current.id !== newVehicleId) {
        await vehicleService.assignDriver(companyId, current.id, null)
      }
      if (newVehicleId) {
        await vehicleService.assignDriver(companyId, newVehicleId, driverId)
      }
      await loadVehicles()
      setAssigningVehicleId(prev => {
        const next = { ...prev }
        delete next[driverId]
        return next
      })
    } catch (error) { console.error(error) }
    finally { setSavingAssign(null) }
  }

  const filteredVehicles = vehicles.filter(v =>
    !vehicleSearch || v.vehicleReg.toLowerCase().includes(vehicleSearch.toLowerCase())
  )

  const columns = useMemo<ColumnDef<Driver>[]>(() => [
    {
      id: 'index',
      header: '#',
      size: 50,
      cell: ({ row }) => row.index + 1,
    },
    {
      accessorKey: 'empNo',
      header: ({ column }) => <SortHeader column={column} label="Emp No" />,
      cell: ({ row }) => <span className="dash-text-navy">{row.original.empNo}</span>,
    },
    {
      id: 'fullName',
      header: ({ column }) => <SortHeader column={column} label="Full Name" />,
      accessorFn: row => `${row.firstName} ${row.lastName}`,
      cell: ({ row }) => `${row.original.firstName} ${row.original.lastName}`,
    },
    {
      accessorKey: 'plantId',
      header: ({ column }) => <SortHeader column={column} label="Plant" />,
      cell: ({ row }) => {
        const plant = PLANT_OPTIONS.find(p => p.id === row.original.plantId)
        return <span className="dash-cell-muted">{plant ? plant.name : row.original.plantId || '—'}</span>
      },
    },
    {
      accessorKey: 'licenseNumber',
      header: ({ column }) => <SortHeader column={column} label="License Nr" />,
      cell: ({ row }) => <span className="dash-cell-muted">{row.original.licenseNumber || '—'}</span>,
    },
    {
      id: 'vehicle',
      header: 'Assigned Vehicle',
      cell: ({ row }) => {
        const driverId = row.original.id
        const currentVehicle = getDriverVehicle(driverId)
        const pendingId = assigningVehicleId[driverId]
        const displayVehicleId = pendingId !== undefined
          ? pendingId
          : (currentVehicle?.id ?? null)

        return (
          <div className="d-flex align-items-center gap-1">
            <Form.Select size="sm"
              style={{ fontSize: 12, minWidth: 130 }}
              value={displayVehicleId ?? ''}
              onChange={(e) => setAssigningVehicleId(prev => ({
                ...prev,
                [driverId]: e.target.value ? Number(e.target.value) : null
              }))}>
              <option value="">— No Vehicle —</option>
              {vehicles.filter(v => v.isActive).map(v => (
                <option key={v.id} value={v.id}
                  disabled={!!v.currentDriverId && v.currentDriverId !== driverId}>
                  {v.vehicleReg}
                  {v.currentDriverId && v.currentDriverId !== driverId ? ' ⚠' : ''}
                </option>
              ))}
            </Form.Select>
            <Button size="sm" disabled={savingAssign === driverId}
              onClick={() => handleAssignVehicle(driverId)}
              className="rounded-md px-2 btn-sky">
              {savingAssign === driverId
                ? <span className="spinner-border spinner-border-sm" style={{ width: 10, height: 10 }} />
                : <LuSave size={11} />}
            </Button>
          </div>
        )
      }
    },
    {
      accessorKey: 'isSignedIn',
      header: ({ column }) => <SortHeader column={column} label="Signed In" />,
      cell: ({ row }) => (
        <Badge bg={row.original.isSignedIn ? 'success' : 'secondary'}>
          {row.original.isSignedIn ? 'Yes' : 'No'}
        </Badge>
      ),
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
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex gap-1">
          <Button size="sm" variant="outline"
            className="rounded-md px-2 !border-slate-300"
            onClick={() => {
              setEditingDriver(row.original)
              setDriverForm({
                empNo: row.original.empNo,
                firstName: row.original.firstName,
                lastName: row.original.lastName,
                plantId: row.original.plantId || 'P001',
                username: row.original.username || '',
                password: '',
                licenseNumber: row.original.licenseNumber || '',
                licenseExpiryDate: row.original.licenseExpiryDate || '',
                isActive: row.original.isActive,
              })
              setShowFormModal(true)
            }}>
            <LuPencil size={11} />
          </Button>
          <Button size="sm" variant="outline"
            className="rounded-md px-2 !border-red-400 !text-red-500 hover:!bg-red-50"
            onClick={() => { setDeletingDriver(row.original); setShowDeleteModal(true) }}>
            <LuTrash2 size={11} />
          </Button>
        </div>
      ),
    }
  ], [vehicles, assigningVehicleId, savingAssign])

  const table = useReactTable({
    data: drivers,
    columns,
    state: { sorting, columnFilters, globalFilter, pagination },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  const totalDrivers = drivers.length
  const start = totalDrivers === 0 ? 0 : pagination.pageIndex * pagination.pageSize + 1
  const end = Math.min((pagination.pageIndex + 1) * pagination.pageSize, table.getFilteredRowModel().rows.length)

  const handleExportExcel = () => {
    const rows = table.getFilteredRowModel().rows.map((row, i) => {
      const d = row.original
      const plant = PLANT_OPTIONS.find(p => p.id === d.plantId)
      const vehicle = getDriverVehicle(d.id)
      return {
        '#':            i + 1,
        'Emp No':       d.empNo,
        'Full Name':    `${d.firstName} ${d.lastName}`,
        'Plant':        plant ? plant.name : d.plantId || '—',
        'License Nr':   d.licenseNumber || '—',
        'Vehicle':      vehicle ? vehicle.vehicleReg : '—',
        'Signed In':    d.isSignedIn ? 'Yes' : 'No',
        'Status':       d.isActive ? 'Active' : 'Inactive',
      }
    })
    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Drivers')
    XLSX.writeFile(wb, `Drivers_${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  return (
    <Container fluid className="py-3">

      <div className="card shadow-sm">
        <div className="card-header d-flex justify-content-between align-items-center py-2">
          <h6 className="mb-0 fw-semibold">
            Drivers ({table.getFilteredRowModel().rows.length} total)
          </h6>
          <div className="d-flex gap-2">
            <Button size="sm" onClick={() => setShowVehicleList(true)}
              className="flex items-center gap-1.5 btn-sky rounded-md">
              <LuCarFront size={13} /> Manage Vehicles
            </Button>
            <Button size="sm" onClick={() => { resetDriverForm(); setShowFormModal(true) }}
              className="flex items-center gap-1.5 btn-navy rounded-md">
              <LuPlus size={13} /> Add Driver
            </Button>
          </div>
        </div>

        <div className="card-body p-3">

          {/* Filters */}
          <div className="dash-filter-bar mb-3">
            <input placeholder="Emp No" className="dash-filter-input"
              onChange={e => table.getColumn('empNo')?.setFilterValue(e.target.value || undefined)} />
            <input placeholder="Full Name" className="dash-filter-input"
              onChange={e => table.getColumn('fullName')?.setFilterValue(e.target.value || undefined)} />
            <select className="dash-filter-input"
              onChange={e => table.getColumn('plantId')?.setFilterValue(e.target.value || undefined)}>
              <option value="">All Plants</option>
              {PLANT_OPTIONS.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
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
              table.getColumn('empNo')?.setFilterValue(undefined)
              table.getColumn('fullName')?.setFilterValue(undefined)
              table.getColumn('plantId')?.setFilterValue(undefined)
              table.getColumn('isActive')?.setFilterValue(undefined)
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
                      No drivers found
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
            <Button size="sm" onClick={handleExportExcel} disabled={drivers.length === 0}
              className="flex items-center gap-1.5 btn-green rounded-md">
              <LuDownload size={13} /> Export to Excel
            </Button>
          </div>

        </div>
      </div>

      {/* ── Add / Edit Driver Modal ── */}
      <Modal show={showFormModal}
        onHide={() => { setShowFormModal(false); resetDriverForm() }}
        centered size="lg">
        <Modal.Header closeButton className="modal-header-dark">
          <Modal.Title style={{ fontSize: 15, fontWeight: 600 }}>
            {editingDriver ? `Edit Driver — ${editingDriver.fullName}` : 'Add New Driver'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <div className="grid grid-cols-2 gap-4">

            <div className="flex flex-col gap-1">
              <label className="field-label">Employee Number <span className="text-red-500">*</span></label>
              <input className="dash-filter-input" placeholder="EMP001"
                value={driverForm.empNo}
                onChange={e => setDriverForm({ ...driverForm, empNo: e.target.value })} />
            </div>

            <div className="flex flex-col gap-1">
              <label className="field-label">Username <span className="text-red-500">*</span></label>
              <input className="dash-filter-input" placeholder="jsmith"
                value={driverForm.username}
                onChange={e => setDriverForm({ ...driverForm, username: e.target.value })} />
            </div>

            {!editingDriver && (
              <div className="flex flex-col gap-1">
                <label className="field-label">Password <span className="text-red-500">*</span></label>
                <input className="dash-filter-input" type="password" placeholder="••••••••"
                  value={driverForm.password}
                  onChange={e => setDriverForm({ ...driverForm, password: e.target.value })} />
              </div>
            )}

            <div className="flex flex-col gap-1">
              <label className="field-label">First Name <span className="text-red-500">*</span></label>
              <input className="dash-filter-input" placeholder="John"
                value={driverForm.firstName}
                onChange={e => setDriverForm({ ...driverForm, firstName: e.target.value })} />
            </div>

            <div className="flex flex-col gap-1">
              <label className="field-label">Last Name <span className="text-red-500">*</span></label>
              <input className="dash-filter-input" placeholder="Smith"
                value={driverForm.lastName}
                onChange={e => setDriverForm({ ...driverForm, lastName: e.target.value })} />
            </div>

            <div className="flex flex-col gap-1">
              <label className="field-label">Plant</label>
              <select className="dash-filter-input" value={driverForm.plantId}
                onChange={e => setDriverForm({ ...driverForm, plantId: e.target.value })}>
                {PLANT_OPTIONS.map(p => (
                  <option key={p.id} value={p.id}>{p.id} - {p.name}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="field-label">License Nr</label>
              <input className="dash-filter-input" placeholder="LIC123456"
                value={driverForm.licenseNumber}
                onChange={e => setDriverForm({ ...driverForm, licenseNumber: e.target.value })} />
            </div>

            <div className="flex flex-col gap-1">
              <label className="field-label">License Expiry Date</label>
              <input className="dash-filter-input" type="date"
                value={driverForm.licenseExpiryDate}
                onChange={e => setDriverForm({ ...driverForm, licenseExpiryDate: e.target.value })} />
            </div>

            <div className="flex items-center gap-2 pt-4">
              <Form.Check type="switch" id="active-driver-switch"
                checked={driverForm.isActive}
                onChange={e => setDriverForm({ ...driverForm, isActive: e.target.checked })} />
              <label htmlFor="active-driver-switch" className="field-label mb-0" style={{ cursor: 'pointer' }}>
                Active Driver
              </label>
            </div>

          </div>
        </Modal.Body>
        <Modal.Footer style={{ borderTop: '1px solid #dde3f0', padding: '0.75rem 1.25rem' }}>
          <Button size="sm" variant="outline"
            onClick={() => { setShowFormModal(false); resetDriverForm() }}
            className="rounded-md px-4">
            Cancel
          </Button>
          <Button size="sm" disabled={saving}
            onClick={handleSaveDriver}
            className="rounded-md px-4 btn-navy">
            {saving ? 'Saving...' : editingDriver ? 'Update Driver' : 'Add Driver'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ── Vehicle Management Modal ── */}
      <Modal show={showVehicleList}
        onHide={() => setShowVehicleList(false)}
        centered size="lg">
        <Modal.Header closeButton className="modal-header-dark">
          <Modal.Title style={{ fontSize: 15, fontWeight: 600 }}>
            <LuCarFront size={16} className="me-2" />Vehicle Management
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">

          {/* Add Vehicle Form */}
          <div className="p-3 mb-4 rounded-lg" style={{ background: '#f8fafc', border: '1px solid #dde3f0' }}>
            <p className="fw-semibold mb-3" style={{ fontSize: 13, color: '#1a2340' }}>Add New Vehicle</p>
            <div className="flex gap-3 items-end">
              <div className="flex flex-col gap-1 flex-1">
                <label className="field-label">Vehicle Registration</label>
                <input className="dash-filter-input" placeholder="ABC 123 GP"
                  value={vehicleReg}
                  onChange={e => setVehicleReg(e.target.value.toUpperCase())} />
              </div>
              <div className="flex flex-col gap-1 flex-1">
                <label className="field-label">Type</label>
                <select className="dash-filter-input" value={vehicleType}
                  onChange={e => setVehicleType(e.target.value)}>
                  <option value="">— Any —</option>
                  <option value="Truck">Truck</option>
                  <option value="Tipper">Tipper</option>
                  <option value="Flatbed">Flatbed</option>
                  <option value="Tanker">Tanker</option>
                  <option value="Van">Van</option>
                </select>
              </div>
              <Button size="sm" disabled={savingVehicle || !vehicleReg.trim()}
                onClick={handleAddVehicle}
                className="flex items-center gap-1.5 btn-green rounded-md px-4">
                <LuPlus size={13} />
                {savingVehicle ? 'Adding...' : 'Add'}
              </Button>
            </div>
          </div>

          {/* Search */}
          <input className="dash-filter-input mb-3 w-full" placeholder="Search vehicles..."
            value={vehicleSearch} onChange={e => setVehicleSearch(e.target.value)} />

          {/* Vehicle Table */}
          <div className="table-responsive">
            <table className="table table-hover table-sm align-middle mb-0" style={{ fontSize: 13 }}>
              <thead className="dash-thead-dark">
                <tr>
                  {['#', 'Vehicle Reg', 'Type', 'Assigned Driver', 'Actions'].map(h => (
                    <th key={h} className="py-2 px-3 text-uppercase">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredVehicles.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center text-muted py-3">No vehicles found</td>
                  </tr>
                ) : (
                  filteredVehicles.map((v, idx) => (
                    <tr key={v.id}>
                      <td className="px-3 text-muted">{idx + 1}</td>
                      <td className="px-3 fw-semibold dash-text-navy">{v.vehicleReg}</td>
                      <td className="px-3 text-muted">{v.vehicleType || '—'}</td>
                      <td className="px-3">
                        {v.currentDriverName
                          ? <span style={{ color: '#16a34a', fontWeight: 600 }}>{v.currentDriverName}</span>
                          : <span className="text-muted">—</span>}
                      </td>
                      <td className="px-3">
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline"
                            className="rounded-md px-2 !border-red-300 !text-red-500 hover:!bg-red-50"
                            onClick={() => handleDeleteVehicle(v.id)}>
                            <LuTrash2 size={11} />
                          </Button>
                          {v.currentDriverId && (
                            <Button size="sm" variant="outline"
                              className="rounded-md px-2 !border-amber-300 !text-amber-600 hover:!bg-amber-50"
                              onClick={async () => {
                                await vehicleService.assignDriver(companyId, v.id, null)
                                await loadVehicles()
                              }}>
                              Unassign
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Modal.Body>
        <Modal.Footer style={{ borderTop: '1px solid #dde3f0', padding: '0.75rem 1.25rem' }}>
          <Button size="sm" variant="outline" onClick={() => setShowVehicleList(false)}
            className="rounded-md px-4">
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ── Delete Driver Modal ── */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered size="sm">
        <Modal.Header closeButton className="modal-header-dark">
          <Modal.Title style={{ fontSize: 15 }}>Delete Driver</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete <strong>{deletingDriver?.fullName}</strong>?
        </Modal.Body>
        <Modal.Footer>
          <RBButton size="sm" variant="outline-secondary"
            onClick={() => setShowDeleteModal(false)}>Cancel</RBButton>
          <RBButton size="sm" variant="danger" disabled={saving} onClick={handleDeleteDriver}>
            {saving ? 'Deleting...' : 'Delete'}
          </RBButton>
        </Modal.Footer>
      </Modal>

    </Container>
  )
}