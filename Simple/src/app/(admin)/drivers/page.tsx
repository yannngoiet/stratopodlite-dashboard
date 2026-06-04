'use client'

import React, { useState, useMemo, useEffect, useCallback } from 'react'
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
import { Badge, Button, Col, Container, Form, Modal, Row } from 'react-bootstrap'
import { LuPencil, LuTrash2, LuPlus, LuCar, LuCarFront, LuSave, LuDownload } from 'react-icons/lu'
import driverService, { type Driver } from '@/services/driverService'
import vehicleService, { type Vehicle } from '@/services/vehicleService'
import { getCompanyId } from '@/helpers/config'

const PLANT_OPTIONS = [
  { id: 'P001', name: 'Acme Head Office - JHB' },
  { id: 'P002', name: 'Acme Depot - CPT' },
  { id: 'P003', name: 'Acme Depot - DBN' },
  { id: 'PLANT001', name: 'Johannesburg Warehouse' },
]

const NAVY = '#2c3e50'

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

  const [showVehicleModal, setShowVehicleModal] = useState(false)
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
      cell: ({ row }) => (
        <span style={{ color: '#888', fontSize: 12 }}>{row.index + 1}</span>
      )
    },
    {
      accessorKey: 'empNo',
      header: 'Emp No',
      cell: ({ row }) => (
        <span style={{ fontWeight: 600, color: NAVY }}>{row.original.empNo}</span>
      )
    },
    {
      id: 'fullName',
      header: 'Full Name',
      accessorFn: row => `${row.firstName} ${row.lastName}`,
      cell: ({ row }) => `${row.original.firstName} ${row.original.lastName}`
    },
    {
      accessorKey: 'plantId',
      header: 'Plant',
      cell: ({ row }) => {
        const plant = PLANT_OPTIONS.find(p => p.id === row.original.plantId)
        return <span style={{ fontSize: 12 }}>{plant ? plant.name : row.original.plantId || '—'}</span>
      }
    },
    {
      accessorKey: 'licenseNumber',
      header: 'License Nr',
      cell: ({ row }) => row.original.licenseNumber || '—',
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
            <Button size="sm"
              style={{ padding: '2px 6px', background: '#17a2b8', border: 'none' }}
              disabled={savingAssign === driverId}
              onClick={() => handleAssignVehicle(driverId)}>
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
      header: 'Signed In',
      cell: ({ row }) => (
        <Badge bg={row.original.isSignedIn ? 'success' : 'secondary'} style={{ fontSize: 11 }}>
          {row.original.isSignedIn ? 'Yes' : 'No'}
        </Badge>
      )
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => (
        <Badge
          style={{
            fontSize: 11,
            background: row.original.isActive ? '#fff3cd' : '#f8d7da',
            color: row.original.isActive ? '#856404' : '#842029',
            border: `1px solid ${row.original.isActive ? '#ffc107' : '#f5c2c7'}`,
            borderRadius: 20,
            padding: '3px 10px'
          }}>
          {row.original.isActive ? 'Active' : 'Inactive'}
        </Badge>
      )
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="d-flex gap-1">
          <Button size="sm" variant="outline-secondary"
            style={{ padding: '2px 6px', fontSize: 11 }}
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
          <Button size="sm" variant="outline-danger"
            style={{ padding: '2px 6px', fontSize: 11 }}
            onClick={() => { setDeletingDriver(row.original); setShowDeleteModal(true) }}>
            <LuTrash2 size={11} />
          </Button>
        </div>
      )
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
  const activeDrivers = drivers.filter(d => d.isActive).length
  const signedInDrivers = drivers.filter(d => d.isSignedIn).length
  const start = totalDrivers === 0 ? 0 : pagination.pageIndex * pagination.pageSize + 1
  const end = Math.min((pagination.pageIndex + 1) * pagination.pageSize, table.getFilteredRowModel().rows.length)

  return (
    <Container fluid className="py-3" style={{ fontSize: 13 }}>

      {/* ── Main Card — matches delivery notes style ── */}
      <div className="card shadow-sm">
        <div className="card-header d-flex justify-content-between align-items-center py-2">
          <h6 className="mb-0 fw-semibold">
            Drivers ({table.getFilteredRowModel().rows.length} total)
          </h6>
          <div className="d-flex gap-2">
            <Button size="sm"
              style={{ background: '#17a2b8', border: 'none', fontSize: 12 }}
              onClick={() => setShowVehicleList(true)}>
              <LuCarFront size={13} className="me-1" />Manage Vehicles
            </Button>
            <Button size="sm"
              style={{ background: NAVY, border: 'none', fontSize: 12 }}
              onClick={() => { resetDriverForm(); setShowFormModal(true) }}>
              <LuPlus size={13} className="me-1" />Add Driver
            </Button>
          </div>
        </div>

        <div className="card-body p-3">

          {/* ── Filters row — matches delivery notes ── */}
          <Row className="g-2 mb-3">
            <Col xs={12} md={4}>
              <Form.Control size="sm" type="text"
                placeholder="Search by name or emp no..."
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
                  table.getColumn('plantId')?.setFilterValue(e.target.value || undefined)
                }}>
                <option value="">All Plants</option>
                {PLANT_OPTIONS.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
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

          {/* ── Pagination — matches delivery notes ── */}
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

          {/* ── Export buttons — matches delivery notes ── */}
          <div className="d-flex justify-content-center mt-3 gap-2">
            <Button style={{ background: '#17a2b8', border: 'none', fontSize: 12 }} size="sm">
              <LuDownload size={13} className="me-1" />Download Report
            </Button>
            <Button style={{ background: '#28a745', border: 'none', fontSize: 12 }} size="sm">
              <LuDownload size={13} className="me-1" />Export to Excel
            </Button>
          </div>

        </div>
      </div>

      {/* ── Add / Edit Driver Modal ── */}
      <Modal show={showFormModal}
        onHide={() => { setShowFormModal(false); resetDriverForm() }}
        centered size="lg">
        <Modal.Header closeButton
          style={{ background: NAVY, color: '#fff' }}>
          <Modal.Title style={{ fontSize: 15 }}>
            {editingDriver ? `Edit Driver — ${editingDriver.fullName}` : 'Add New Driver'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row className="g-3">
            <Col md={6}>
              <Form.Label style={{ fontSize: 12 }}>Employee Number <span className="text-danger">*</span></Form.Label>
              <Form.Control size="sm" placeholder="EMP001"
                value={driverForm.empNo}
                onChange={e => setDriverForm({ ...driverForm, empNo: e.target.value })} />
            </Col>
            <Col md={6}>
              <Form.Label style={{ fontSize: 12 }}>Username <span className="text-danger">*</span></Form.Label>
              <Form.Control size="sm" placeholder="jsmith"
                value={driverForm.username}
                onChange={e => setDriverForm({ ...driverForm, username: e.target.value })} />
            </Col>
            {!editingDriver && (
              <Col md={6}>
                <Form.Label style={{ fontSize: 12 }}>Password <span className="text-danger">*</span></Form.Label>
                <Form.Control size="sm" type="password" placeholder="••••••••"
                  value={driverForm.password}
                  onChange={e => setDriverForm({ ...driverForm, password: e.target.value })} />
              </Col>
            )}
            <Col md={6}>
              <Form.Label style={{ fontSize: 12 }}>First Name <span className="text-danger">*</span></Form.Label>
              <Form.Control size="sm" placeholder="John"
                value={driverForm.firstName}
                onChange={e => setDriverForm({ ...driverForm, firstName: e.target.value })} />
            </Col>
            <Col md={6}>
              <Form.Label style={{ fontSize: 12 }}>Last Name <span className="text-danger">*</span></Form.Label>
              <Form.Control size="sm" placeholder="Smith"
                value={driverForm.lastName}
                onChange={e => setDriverForm({ ...driverForm, lastName: e.target.value })} />
            </Col>
            <Col md={6}>
              <Form.Label style={{ fontSize: 12 }}>Plant</Form.Label>
              <Form.Select size="sm" value={driverForm.plantId}
                onChange={e => setDriverForm({ ...driverForm, plantId: e.target.value })}>
                {PLANT_OPTIONS.map(p => (
                  <option key={p.id} value={p.id}>{p.id} - {p.name}</option>
                ))}
              </Form.Select>
            </Col>
            <Col md={6}>
              <Form.Label style={{ fontSize: 12 }}>License Nr</Form.Label>
              <Form.Control size="sm" placeholder="LIC123456"
                value={driverForm.licenseNumber}
                onChange={e => setDriverForm({ ...driverForm, licenseNumber: e.target.value })} />
            </Col>
            <Col md={6}>
              <Form.Label style={{ fontSize: 12 }}>License Expiry Date</Form.Label>
              <Form.Control size="sm" type="date"
                value={driverForm.licenseExpiryDate}
                onChange={e => setDriverForm({ ...driverForm, licenseExpiryDate: e.target.value })} />
            </Col>
            <Col md={6} className="d-flex align-items-end pb-1">
              <Form.Check type="switch" label="Active Driver"
                checked={driverForm.isActive}
                onChange={e => setDriverForm({ ...driverForm, isActive: e.target.checked })} />
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button size="sm" variant="outline-secondary"
            onClick={() => { setShowFormModal(false); resetDriverForm() }}>
            Cancel
          </Button>
          <Button size="sm"
            style={{ background: NAVY, border: 'none' }}
            disabled={saving}
            onClick={handleSaveDriver}>
            {saving ? 'Saving...' : editingDriver ? 'Update Driver' : 'Add Driver'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ── Vehicle Management Modal ── */}
      <Modal show={showVehicleList}
        onHide={() => setShowVehicleList(false)}
        centered size="lg">
        <Modal.Header closeButton style={{ background: NAVY, color: '#fff' }}>
          <Modal.Title style={{ fontSize: 15 }}>
            <LuCarFront size={16} className="me-2" />Vehicle Management
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* Add Vehicle Form */}
          <div className="p-3 mb-3 rounded"
            style={{ background: '#f8f9fa', border: '1px solid #dee2e6' }}>
            <h6 className="fw-semibold mb-2" style={{ fontSize: 13 }}>Add New Vehicle</h6>
            <Row className="g-2 align-items-end">
              <Col xs={5}>
                <Form.Label style={{ fontSize: 12 }}>Vehicle Registration</Form.Label>
                <Form.Control size="sm" placeholder="ABC 123 GP"
                  value={vehicleReg}
                  onChange={e => setVehicleReg(e.target.value.toUpperCase())} />
              </Col>
              <Col xs={4}>
                <Form.Label style={{ fontSize: 12 }}>Type</Form.Label>
                <Form.Select size="sm" value={vehicleType}
                  onChange={e => setVehicleType(e.target.value)}>
                  <option value="">— Any —</option>
                  <option value="Truck">Truck</option>
                  <option value="Tipper">Tipper</option>
                  <option value="Flatbed">Flatbed</option>
                  <option value="Tanker">Tanker</option>
                  <option value="Van">Van</option>
                </Form.Select>
              </Col>
              <Col xs={3}>
                <Button size="sm" className="w-100"
                  style={{ background: '#28a745', border: 'none' }}
                  disabled={savingVehicle || !vehicleReg.trim()}
                  onClick={handleAddVehicle}>
                  <LuPlus size={13} className="me-1" />
                  {savingVehicle ? 'Adding...' : 'Add'}
                </Button>
              </Col>
            </Row>
          </div>

          {/* Vehicle List */}
          <Form.Control size="sm" placeholder="Search vehicles..."
            className="mb-2" value={vehicleSearch}
            onChange={e => setVehicleSearch(e.target.value)} />

          <div className="table-responsive">
            <table className="table table-bordered table-hover table-sm align-middle mb-0"
              style={{ fontSize: 13 }}>
              <thead>
                <tr>
                  {['#', 'Vehicle Reg', 'Type', 'Assigned Driver', 'Actions'].map(h => (
                    <th key={h} className="py-2 px-3 text-uppercase"
                      style={{ background: NAVY, color: '#fff', fontSize: '0.72rem', fontWeight: 600 }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredVehicles.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center text-muted py-3">No vehicles</td>
                  </tr>
                ) : (
                  filteredVehicles.map((v, idx) => (
                    <tr key={v.id}>
                      <td className="px-3 text-muted">{idx + 1}</td>
                      <td className="px-3 fw-semibold" style={{ color: NAVY }}>{v.vehicleReg}</td>
                      <td className="px-3">{v.vehicleType || '—'}</td>
                      <td className="px-3">
                        {v.currentDriverName
                          ? <span style={{ color: '#28a745', fontWeight: 600 }}>{v.currentDriverName}</span>
                          : <span className="text-muted">—</span>
                        }
                      </td>
                      <td className="px-3">
                        <div className="d-flex gap-1">
                          <Button size="sm" variant="outline-danger"
                            style={{ padding: '2px 6px' }}
                            onClick={() => handleDeleteVehicle(v.id)}>
                            <LuTrash2 size={10} />
                          </Button>
                          {v.currentDriverId && (
                            <Button size="sm" variant="outline-warning"
                              style={{ padding: '2px 6px', fontSize: 11 }}
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
        <Modal.Footer>
          <Button size="sm" variant="outline-secondary" onClick={() => setShowVehicleList(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ── Delete Driver Modal ── */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered size="sm">
        <Modal.Header closeButton style={{ background: NAVY, color: '#fff' }}>
          <Modal.Title style={{ fontSize: 15 }}>Delete Driver</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete <strong>{deletingDriver?.fullName}</strong>?
        </Modal.Body>
        <Modal.Footer>
          <Button size="sm" variant="outline-secondary"
            onClick={() => setShowDeleteModal(false)}>Cancel</Button>
          <Button size="sm" variant="danger" disabled={saving} onClick={handleDeleteDriver}>
            {saving ? 'Deleting...' : 'Delete'}
          </Button>
        </Modal.Footer>
      </Modal>

    </Container>
  )
}