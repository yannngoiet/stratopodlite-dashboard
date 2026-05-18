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
import { LuPencil, LuTrash2, LuPlus, LuCar, LuCarFront, LuSave } from 'react-icons/lu'
import driverService, { type Driver } from '@/services/driverService'
import vehicleService, { type Vehicle } from '@/services/vehicleService'
import { getCompanyId } from '@/helpers/config'

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(false)
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 })

  // Delete modal
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deletingDriver, setDeletingDriver] = useState<Driver | null>(null)
  const [saving, setSaving] = useState(false)

  // Driver form (right panel — used for both add and edit)
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null)
  const [driverForm, setDriverForm] = useState({
    empNo: '', firstName: '', lastName: '',
    plantId: '', username: '', licenseNumber: '',
    licenseExpiryDate: '', isActive: true,
  })

  // Vehicle form (right panel)
  const [vehicleReg, setVehicleReg] = useState('')
  const [vehicleType, setVehicleType] = useState('')
  const [savingVehicle, setSavingVehicle] = useState(false)
  const [vehicleSearch, setVehicleSearch] = useState('')

  // Inline vehicle assignment per driver row
  const [assigningVehicleId, setAssigningVehicleId] = useState<Record<number, number | null>>({})
  const [savingAssign, setSavingAssign] = useState<number | null>(null)

  const companyId = getCompanyId()

  const loadDrivers = useCallback(async () => {
    setLoading(true)
    try {
      const data = await driverService.getAll()
      setDrivers(data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }, [])

  const loadVehicles = useCallback(async () => {
    try {
      const data = await vehicleService.getAll(companyId)
      setVehicles(data)
    } catch (error) {
      console.error(error)
    }
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
      plantId: '', username: '', licenseNumber: '',
      licenseExpiryDate: '', isActive: true,
    })
    setEditingDriver(null)
  }

  const handleSaveDriver = async () => {
    if (!driverForm.empNo.trim() || !driverForm.firstName.trim() || !driverForm.lastName.trim()) return
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
          licenseNumber: driverForm.licenseNumber || null,
          licenseExpiryDate: driverForm.licenseExpiryDate || null,
          isActive: driverForm.isActive,
        })
      }
      await loadDrivers()
      resetDriverForm()
    } catch (error) {
      console.error(error)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteDriver = async () => {
    if (!deletingDriver) return
    setSaving(true)
    try {
      await driverService.delete(deletingDriver.id)
      await loadDrivers()
      setShowDeleteModal(false)
      setDeletingDriver(null)
    } catch (error) {
      console.error(error)
    } finally {
      setSaving(false)
    }
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
    } catch (error) {
      console.error(error)
    } finally {
      setSavingVehicle(false)
    }
  }

  const handleDeleteVehicle = async (vehicleId: number) => {
    if (!confirm('Delete this vehicle?')) return
    try {
      await vehicleService.delete(companyId, vehicleId)
      await loadVehicles()
    } catch (error) {
      console.error(error)
    }
  }

  const handleAssignVehicle = async (driverId: number) => {
    const newVehicleId = assigningVehicleId[driverId] ?? null
    setSavingAssign(driverId)
    try {
      const current = getDriverVehicle(driverId)
      // Unassign from current vehicle first
      if (current && current.id !== newVehicleId) {
        await vehicleService.assignDriver(companyId, current.id, null)
      }
      // Assign to new vehicle
      if (newVehicleId) {
        await vehicleService.assignDriver(companyId, newVehicleId, driverId)
      }
      await loadVehicles()
      // Clear pending state for this driver
      setAssigningVehicleId(prev => {
        const next = { ...prev }
        delete next[driverId]
        return next
      })
    } catch (error) {
      console.error(error)
    } finally {
      setSavingAssign(null)
    }
  }

  const filteredVehicles = vehicles.filter(v =>
    !vehicleSearch || v.vehicleReg.toLowerCase().includes(vehicleSearch.toLowerCase())
  )

  const columns = useMemo<ColumnDef<Driver>[]>(() => [
    {
      accessorKey: 'empNo',
      header: 'Emp No',
    },
    {
      id: 'fullName',
      header: 'Full Name',
      accessorFn: row => `${row.firstName} ${row.lastName}`,
    },
    {
      accessorKey: 'plantId',
      header: 'Plant',
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
            <Form.Select
              size="sm"
              style={{ fontSize: 12, minWidth: 130 }}
              value={displayVehicleId ?? ''}
              onChange={(e) => setAssigningVehicleId(prev => ({
                ...prev,
                [driverId]: e.target.value ? Number(e.target.value) : null
              }))}>
              <option value="">— No Vehicle —</option>
              {vehicles.filter(v => v.isActive).map(v => (
                <option
                  key={v.id}
                  value={v.id}
                  disabled={!!v.currentDriverId && v.currentDriverId !== driverId}>
                  {v.vehicleReg}
                  {v.currentDriverId && v.currentDriverId !== driverId ? ' ⚠' : ''}
                </option>
              ))}
            </Form.Select>
            <Button
              size="sm"
              variant="outline-success"
              style={{ padding: '2px 6px' }}
              disabled={savingAssign === driverId}
              title="Save assignment"
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
        <Badge bg={row.original.isSignedIn ? 'success' : 'secondary'}>
          {row.original.isSignedIn ? 'Yes' : 'No'}
        </Badge>
      )
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => (
        <Badge bg={row.original.isActive ? 'success' : 'danger'}>
          {row.original.isActive ? 'Active' : 'Inactive'}
        </Badge>
      )
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="d-flex gap-1">
          <Button size="sm" variant="outline-primary"
            onClick={() => {
              setEditingDriver(row.original)
              setDriverForm({
                empNo: row.original.empNo,
                firstName: row.original.firstName,
                lastName: row.original.lastName,
                plantId: row.original.plantId,
                username: row.original.username || '',
                licenseNumber: row.original.licenseNumber || '',
                licenseExpiryDate: row.original.licenseExpiryDate || '',
                isActive: row.original.isActive,
              })
            }}>
            <LuPencil size={12} />
          </Button>
          <Button size="sm" variant="outline-danger"
            onClick={() => { setDeletingDriver(row.original); setShowDeleteModal(true) }}>
            <LuTrash2 size={12} />
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

  return (
    <Container fluid className="py-3">

      {/* Header */}
      <div className="mb-3">
        <h4 className="fw-bold d-flex align-items-center gap-2 mb-1">
          <LuCar size={22} /> Driver Management
        </h4>
        <p className="text-muted small mb-0">Manage your drivers and vehicle assignments</p>
      </div>

      {/* Stats */}
      <div className="row g-3 mb-3">
        <div className="col-6 col-md-3">
          <div className="card shadow-sm text-center py-3">
            <div className="text-muted small">Total Drivers</div>
            <div className="fs-3 fw-bold">{totalDrivers}</div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card shadow-sm text-center py-3">
            <div className="text-muted small">Active</div>
            <div className="fs-3 fw-bold text-success">{activeDrivers}</div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card shadow-sm text-center py-3">
            <div className="text-muted small">Signed In</div>
            <div className="fs-3 fw-bold text-primary">{signedInDrivers}</div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card shadow-sm text-center py-3">
            <div className="text-muted small">Inactive</div>
            <div className="fs-3 fw-bold text-danger">{totalDrivers - activeDrivers}</div>
          </div>
        </div>
      </div>

      <Row className="g-3">

        {/* ── LEFT: Driver Table ──────────────────────────────────── */}
        <Col lg={8}>
          <div className="card shadow-sm">
            <div className="card-header d-flex justify-content-between align-items-center py-2">
              <h6 className="mb-0 fw-semibold">
                Drivers ({table.getFilteredRowModel().rows.length})
              </h6>
            </div>
            <div className="card-body p-3">
              <div className="mb-3">
                <Form.Control size="sm" type="text" placeholder="Search drivers..."
                  value={globalFilter}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  style={{ maxWidth: 280 }} />
              </div>

              <div className="table-responsive">
                <table className="table table-bordered table-striped table-hover table-sm align-middle mb-0">
                  <thead style={{ backgroundColor: '#2c3e50', color: '#fff', fontSize: '0.75rem' }}>
                    {table.getHeaderGroups().map(hg => (
                      <tr key={hg.id}>
                        {hg.headers.map(h => (
                          <th key={h.id} className="py-2 px-3 text-uppercase"
                            style={{ cursor: h.column.getCanSort() ? 'pointer' : 'default' }}
                            onClick={h.column.getToggleSortingHandler()}>
                            <div className="d-flex align-items-center gap-1">
                              {flexRender(h.column.columnDef.header, h.getContext())}
                              {h.column.getCanSort() && (
                                <span style={{ opacity: 0.6, fontSize: 10 }}>
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
                  Showing {table.getRowModel().rows.length} of{' '}
                  {table.getFilteredRowModel().rows.length} drivers
                </small>
                <div className="d-flex align-items-center gap-2">
                  <Form.Select size="sm" style={{ width: 100 }}
                    value={pagination.pageSize}
                    onChange={(e) => setPagination(p => ({
                      ...p, pageSize: Number(e.target.value), pageIndex: 0
                    }))}>
                    {[10, 20, 50].map(s => (
                      <option key={s} value={s}>{s} / page</option>
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
                      Page {table.getState().pagination.pageIndex + 1} of{' '}
                      {table.getPageCount() || 1}
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
        </Col>

        {/* ── RIGHT: Forms + Vehicle List ─────────────────────────── */}
        <Col lg={4}>

          {/* Add / Edit Driver Form */}
          <div className="card shadow-sm mb-3">
            <div className="card-header py-2"
              style={{ background: '#2c7be5', color: '#fff' }}>
              <h6 className="mb-0 fw-semibold d-flex align-items-center gap-2">
                <LuCar size={15} />
                {editingDriver ? `Edit — ${editingDriver.fullName}` : 'Add New Driver'}
              </h6>
            </div>
            <div className="card-body p-3">
              <Row className="g-2">
                <Col xs={6}>
                  <Form.Label className="small mb-1">
                    Employee Number <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control size="sm" placeholder="EMP001"
                    value={driverForm.empNo}
                    onChange={e => setDriverForm({ ...driverForm, empNo: e.target.value })} />
                </Col>
                <Col xs={6}>
                  <Form.Label className="small mb-1">
                    First Name <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control size="sm" placeholder="John"
                    value={driverForm.firstName}
                    onChange={e => setDriverForm({ ...driverForm, firstName: e.target.value })} />
                </Col>
                <Col xs={6}>
                  <Form.Label className="small mb-1">
                    Last Name <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control size="sm" placeholder="Smith"
                    value={driverForm.lastName}
                    onChange={e => setDriverForm({ ...driverForm, lastName: e.target.value })} />
                </Col>
                <Col xs={6}>
                  <Form.Label className="small mb-1">Plant ID</Form.Label>
                  <Form.Control size="sm" placeholder="PLT001"
                    value={driverForm.plantId}
                    onChange={e => setDriverForm({ ...driverForm, plantId: e.target.value })} />
                </Col>
                <Col xs={6}>
                  <Form.Label className="small mb-1">Username</Form.Label>
                  <Form.Control size="sm" placeholder="jsmith"
                    value={driverForm.username}
                    onChange={e => setDriverForm({ ...driverForm, username: e.target.value })} />
                </Col>
                <Col xs={6}>
                  <Form.Label className="small mb-1">License Nr</Form.Label>
                  <Form.Control size="sm" placeholder="LIC123456"
                    value={driverForm.licenseNumber}
                    onChange={e => setDriverForm({ ...driverForm, licenseNumber: e.target.value })} />
                </Col>
                <Col xs={6}>
                  <Form.Label className="small mb-1">License Expiry</Form.Label>
                  <Form.Control size="sm" type="date"
                    value={driverForm.licenseExpiryDate}
                    onChange={e => setDriverForm({ ...driverForm, licenseExpiryDate: e.target.value })} />
                </Col>
                <Col xs={6} className="d-flex align-items-end pb-1">
                  <Form.Check type="switch" label="Active"
                    checked={driverForm.isActive}
                    onChange={e => setDriverForm({ ...driverForm, isActive: e.target.checked })} />
                </Col>
              </Row>
              <div className="d-flex gap-2 mt-3">
                {editingDriver && (
                  <Button size="sm" variant="secondary" onClick={resetDriverForm}>
                    Cancel
                  </Button>
                )}
                <Button size="sm" variant="primary" className="flex-grow-1"
                  disabled={saving} onClick={handleSaveDriver}>
                  <LuPlus size={13} className="me-1" />
                  {saving ? 'Saving...' : editingDriver ? 'Update Driver' : 'Add Driver'}
                </Button>
              </div>
            </div>
          </div>

          {/* Add Vehicle Form */}
          <div className="card shadow-sm mb-3">
            <div className="card-header py-2"
              style={{ background: '#2c7be5', color: '#fff' }}>
              <h6 className="mb-0 fw-semibold d-flex align-items-center gap-2">
                <LuCarFront size={15} />
                Add Management Vehicle
              </h6>
            </div>
            <div className="card-body p-3">
              <Row className="g-2">
                <Col xs={7}>
                  <Form.Label className="small mb-1">Vehicle Registration</Form.Label>
                  <Form.Control size="sm" placeholder="ABC 123 GP"
                    value={vehicleReg}
                    onChange={e => setVehicleReg(e.target.value.toUpperCase())} />
                </Col>
                <Col xs={5}>
                  <Form.Label className="small mb-1">Type</Form.Label>
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
              </Row>
              <Button size="sm" variant="primary" className="w-100 mt-3"
                disabled={savingVehicle || !vehicleReg.trim()}
                onClick={handleAddVehicle}>
                <LuPlus size={13} className="me-1" />
                {savingVehicle ? 'Adding...' : 'Add Vehicle'}
              </Button>
            </div>
          </div>

          {/* Vehicle List */}
          <div className="card shadow-sm">
            <div className="card-header py-2"
              style={{ background: '#2c7be5', color: '#fff' }}>
              <h6 className="mb-0 fw-semibold d-flex align-items-center gap-2">
                <LuCarFront size={15} />
                Management Vehicles ({vehicles.length})
              </h6>
            </div>
            <div className="card-body p-3">
              <Form.Control size="sm" placeholder="Search..."
                className="mb-2" value={vehicleSearch}
                onChange={e => setVehicleSearch(e.target.value)} />
              <div style={{ maxHeight: 280, overflowY: 'auto' }}>
                <table className="table table-sm table-bordered align-middle mb-0"
                  style={{ fontSize: '0.78rem' }}>
                  <thead style={{ background: '#2c3e50', color: '#fff' }}>
                    <tr>
                      <th className="px-2 py-1">#</th>
                      <th className="px-2 py-1">Vehicle Reg</th>
                      <th className="px-2 py-1">Driver</th>
                      <th className="px-2 py-1">Act</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredVehicles.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="text-center text-muted py-3">
                          No vehicles
                        </td>
                      </tr>
                    ) : (
                      filteredVehicles.map((v, idx) => (
                        <tr key={v.id}>
                          <td className="px-2 text-muted">{idx + 1}</td>
                          <td className="px-2">
                            <span className="fw-semibold">{v.vehicleReg}</span>
                            {v.vehicleType && (
                              <span className="text-muted ms-1" style={{ fontSize: 10 }}>
                                ({v.vehicleType})
                              </span>
                            )}
                          </td>
                          <td className="px-2">
                            {v.currentDriverName
                              ? <span className="text-success" style={{ fontSize: 11 }}>
                                  {v.currentDriverName}
                                </span>
                              : <span className="text-muted">—</span>
                            }
                          </td>
                          <td className="px-2">
                            <div className="d-flex gap-1">
                              <Button size="sm" variant="danger"
                                style={{ padding: '1px 5px' }}
                                onClick={() => handleDeleteVehicle(v.id)}>
                                <LuTrash2 size={10} />
                              </Button>
                              {v.currentDriverId && (
                                <Button size="sm" variant="warning"
                                  style={{ padding: '1px 5px' }}
                                  title="Unassign driver"
                                  onClick={async () => {
                                    await vehicleService.assignDriver(companyId, v.id, null)
                                    await loadVehicles()
                                  }}>
                                  <LuCar size={10} />
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
            </div>
          </div>

        </Col>
      </Row>

      {/* Delete Driver Modal */}
      <Modal show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)} centered size="sm">
        <Modal.Header closeButton>
          <Modal.Title>Delete Driver</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete{' '}
          <strong>{deletingDriver?.fullName}</strong>?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" size="sm"
            onClick={() => setShowDeleteModal(false)}>Cancel</Button>
          <Button variant="danger" size="sm" disabled={saving}
            onClick={handleDeleteDriver}>
            {saving ? 'Deleting...' : 'Delete'}
          </Button>
        </Modal.Footer>
      </Modal>

    </Container>
  )
}