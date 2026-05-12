'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from '@tanstack/react-table';
import {
  Container, Form, Button, Row, Col, Badge,
  Modal, FormGroup, FormLabel, FormControl, FormCheck
} from 'react-bootstrap';
import { LuSearch, LuRefreshCw, LuPlus, LuPencil, LuTrash2, LuCarFront } from 'react-icons/lu';
import vehicleService, { type Vehicle } from '@/services/vehicleService';

interface VehicleForm {
  vehicleReg: string
  trailerReg: string
  vehicleType: string
  isActive: boolean
}

const defaultForm: VehicleForm = {
  vehicleReg: '',
  trailerReg: '',
  vehicleType: '',
  isActive: true
}

const COMPANY_ID = 1

const formatDate = (date: string) =>
  new Date(date).toLocaleString('en-ZA', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })

const Page = () => {
  const [data, setData] = useState<Vehicle[]>([])
  const [allData, setAllData] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(false)
  const [totalCount, setTotalCount] = useState(0)
  const [page, setPage] = useState(1)
  const pageSize = 10
  const [totalPages, setTotalPages] = useState(0)

  const [vehicleReg, setVehicleReg] = useState('')
  const [vehicleType, setVehicleType] = useState('')

  const [showModal, setShowModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
  const [form, setForm] = useState<VehicleForm>(defaultForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const applyFiltersAndPaginate = (
    all: Vehicle[],
    reg: string,
    type: string,
    currentPage: number
  ) => {
    let result = [...all]
    if (reg) result = result.filter(v =>
      v.vehicleReg.toLowerCase().includes(reg.toLowerCase()))
    if (type) result = result.filter(v =>
      v.vehicleType?.toLowerCase().includes(type.toLowerCase()))
    setTotalCount(result.length)
    setTotalPages(Math.ceil(result.length / pageSize) || 1)
    const start = (currentPage - 1) * pageSize
    setData(result.slice(start, start + pageSize))
  }

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const result = await vehicleService.getAll(COMPANY_ID)
      setAllData(result)
      applyFiltersAndPaginate(result, '', '', 1)
    } catch (err) {
      console.error(err)
      setData([])
      setAllData([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const handleSearch = () => {
    setPage(1)
    applyFiltersAndPaginate(allData, vehicleReg, vehicleType, 1)
  }

  const handleReset = () => {
    setVehicleReg('')
    setVehicleType('')
    setPage(1)
    applyFiltersAndPaginate(allData, '', '', 1)
  }

  const handlePageChange = (p: number) => {
    setPage(p)
    applyFiltersAndPaginate(allData, vehicleReg, vehicleType, p)
  }

  const openCreate = () => {
    setSelectedVehicle(null)
    setForm(defaultForm)
    setError(null)
    setShowModal(true)
  }

  const openEdit = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle)
    setForm({
      vehicleReg: vehicle.vehicleReg,
      trailerReg: vehicle.trailerReg ?? '',
      vehicleType: vehicle.vehicleType ?? '',
      isActive: vehicle.isActive
    })
    setError(null)
    setShowModal(true)
  }

  const openDelete = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle)
    setShowDeleteModal(true)
  }

  const handleSave = async () => {
    if (!form.vehicleReg.trim()) { setError('Vehicle registration is required'); return }
    setSaving(true)
    setError(null)
    try {
      const isEdit = !!selectedVehicle
      if (isEdit) {
        await vehicleService.update(COMPANY_ID, selectedVehicle!.id, {
          vehicleReg: form.vehicleReg,
          trailerReg: form.trailerReg || null,
          vehicleType: form.vehicleType || null,
          isActive: form.isActive
        })
      } else {
        await vehicleService.create(COMPANY_ID, {
          vehicleReg: form.vehicleReg,
          trailerReg: form.trailerReg || null,
          vehicleType: form.vehicleType || null,
          isActive: form.isActive
        })
      }
      setShowModal(false)
      await fetchData()
    } catch (err: any) {
      setError(err.response?.data || err.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedVehicle) return
    setSaving(true)
    try {
      await vehicleService.delete(COMPANY_ID, selectedVehicle.id)
      setShowDeleteModal(false)
      await fetchData()
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const columns: ColumnDef<Vehicle>[] = [
    {
      header: '#',
      cell: ({ row }) => (page - 1) * pageSize + row.index + 1,
      size: 50
    },
    { accessorKey: 'vehicleReg', header: 'Vehicle Reg' },
    {
      accessorKey: 'trailerReg',
      header: 'Trailer Reg',
      cell: ({ row }) => row.original.trailerReg ?? '-'
    },
    {
      accessorKey: 'vehicleType',
      header: 'Vehicle Type',
      cell: ({ row }) => row.original.vehicleType ?? '-'
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
      accessorKey: 'createdAt',
      header: 'Created',
      cell: ({ row }) => formatDate(row.original.createdAt)
    },
    {
      accessorKey: 'updatedAt',
      header: 'Updated',
      cell: ({ row }) => formatDate(row.original.updatedAt)
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="d-flex gap-1">
          <Button size="sm" variant="outline-primary" onClick={() => openEdit(row.original)}>
            <LuPencil />
          </Button>
          <Button size="sm" variant="outline-danger" onClick={() => openDelete(row.original)}>
            <LuTrash2 />
          </Button>
        </div>
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
            <LuCarFront /> Vehicles ({totalCount})
          </h6>
          <Button size="sm" variant="primary" onClick={openCreate}>
            <LuPlus className="me-1" />Add Vehicle
          </Button>
        </div>

        <div className="card-body p-3">
          {/* Filters */}
          <Row className="g-2 mb-3 align-items-center">
            <Col xs={12} md={4}>
              <Form.Control
                size="sm" type="text" placeholder="Vehicle Reg"
                value={vehicleReg}
                onChange={e => setVehicleReg(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
              />
            </Col>
            <Col xs={12} md={4}>
              <Form.Control
                size="sm" type="text" placeholder="Vehicle Type"
                value={vehicleType}
                onChange={e => setVehicleType(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
              />
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

          {/* Table */}
          <div className="table-responsive">
            <table className="table table-bordered table-striped table-hover table-sm align-middle mb-0">
              <thead style={{ backgroundColor: '#2c3e50', color: '#fff', fontSize: '0.75rem' }}>
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

      {/* Add/Edit Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{selectedVehicle ? 'Edit Vehicle' : 'Add Vehicle'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <div className="alert alert-danger py-2 mb-3">{error}</div>}
          <FormGroup className="mb-3">
            <FormLabel>Vehicle Registration <span className="text-danger">*</span></FormLabel>
            <FormControl size="sm" type="text" placeholder="e.g. ABC 123 GP"
              value={form.vehicleReg}
              onChange={e => setForm({ ...form, vehicleReg: e.target.value })} />
          </FormGroup>
          <FormGroup className="mb-3">
            <FormLabel>Trailer Registration</FormLabel>
            <FormControl size="sm" type="text" placeholder="e.g. TRL 456 GP"
              value={form.trailerReg}
              onChange={e => setForm({ ...form, trailerReg: e.target.value })} />
          </FormGroup>
          <FormGroup className="mb-3">
            <FormLabel>Vehicle Type</FormLabel>
            <Form.Select size="sm" value={form.vehicleType}
              onChange={e => setForm({ ...form, vehicleType: e.target.value })}>
              <option value="">Select type...</option>
              <option value="Truck">Truck</option>
              <option value="Tipper">Tipper</option>
              <option value="Flatbed">Flatbed</option>
              <option value="Tanker">Tanker</option>
              <option value="Van">Van</option>
              <option value="Other">Other</option>
            </Form.Select>
          </FormGroup>
          <FormGroup>
            <FormCheck type="switch" label="Active"
              checked={form.isActive}
              onChange={e => setForm({ ...form, isActive: e.target.checked })} />
          </FormGroup>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" size="sm" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button variant="primary" size="sm" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered size="sm">
        <Modal.Header closeButton>
          <Modal.Title>Delete Vehicle</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete <strong>{selectedVehicle?.vehicleReg}</strong>?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" size="sm" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
          <Button variant="danger" size="sm" onClick={handleDelete} disabled={saving}>
            {saving ? 'Deleting...' : 'Delete'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  )
}

export default Page