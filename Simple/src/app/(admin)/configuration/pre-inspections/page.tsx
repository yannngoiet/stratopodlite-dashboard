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
import { LuSearch, LuRefreshCw, LuPlus, LuPencil, LuTrash2, LuShieldCheck } from 'react-icons/lu';

interface PreInspection {
  id: number
  description: string
  category: string | null
  inspectionType: string
  isMandatory: boolean
  isSupervisor: boolean
  sortOrder: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface PreInspectionForm {
  description: string
  category: string
  inspectionType: string
  isMandatory: boolean
  isSupervisor: boolean
  sortOrder: number
  isActive: boolean
}

const defaultForm: PreInspectionForm = {
  description: '',
  category: '',
  inspectionType: '',
  isMandatory: false,
  isSupervisor: false,
  sortOrder: 0,
  isActive: true
}

const getCompanyId = (): number => {
  if (typeof window === 'undefined') return 0
  const user = localStorage.getItem('user')
  return user ? JSON.parse(user).companyId ?? 0 : 0
}

const getToken = (): string => {
  if (typeof window === 'undefined') return ''
  return localStorage.getItem('accessToken') ?? ''
}

const formatDate = (date: string) =>
  new Date(date).toLocaleString('en-ZA', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })

const Page = () => {
  const [data, setData] = useState<PreInspection[]>([])
  const [allData, setAllData] = useState<PreInspection[]>([])
  const [loading, setLoading] = useState(false)
  const [totalCount, setTotalCount] = useState(0)
  const [page, setPage] = useState(1)
  const pageSize = 10
  const [totalPages, setTotalPages] = useState(0)

  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [inspectionType, setInspectionType] = useState('')

  const [showModal, setShowModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState<PreInspection | null>(null)
  const [form, setForm] = useState<PreInspectionForm>(defaultForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const applyFiltersAndPaginate = (
    all: PreInspection[],
    desc: string,
    cat: string,
    type: string,
    currentPage: number
  ) => {
    let result = [...all]
    if (desc) result = result.filter(p =>
      p.description.toLowerCase().includes(desc.toLowerCase()))
    if (cat) result = result.filter(p =>
      p.category?.toLowerCase().includes(cat.toLowerCase()))
    if (type) result = result.filter(p =>
      p.inspectionType.toLowerCase().includes(type.toLowerCase()))
    setTotalCount(result.length)
    setTotalPages(Math.ceil(result.length / pageSize) || 1)
    const start = (currentPage - 1) * pageSize
    setData(result.slice(start, start + pageSize))
  }

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const companyId = getCompanyId()
      const token = getToken()
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/companies/${companyId}/pre-inspections`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )
      if (!res.ok) throw new Error('Failed to fetch')
      const result: PreInspection[] = await res.json()
      setAllData(result)
      applyFiltersAndPaginate(result, '', '', '', 1)
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
    applyFiltersAndPaginate(allData, description, category, inspectionType, 1)
  }

  const handleReset = () => {
    setDescription('')
    setCategory('')
    setInspectionType('')
    setPage(1)
    applyFiltersAndPaginate(allData, '', '', '', 1)
  }

  const handlePageChange = (p: number) => {
    setPage(p)
    applyFiltersAndPaginate(allData, description, category, inspectionType, p)
  }

  const openCreate = () => {
    setSelectedItem(null)
    setForm(defaultForm)
    setError(null)
    setShowModal(true)
  }

  const openEdit = (item: PreInspection) => {
    setSelectedItem(item)
    setForm({
      description: item.description,
      category: item.category ?? '',
      inspectionType: item.inspectionType,
      isMandatory: item.isMandatory,
      isSupervisor: item.isSupervisor,
      sortOrder: item.sortOrder,
      isActive: item.isActive
    })
    setError(null)
    setShowModal(true)
  }

  const openDelete = (item: PreInspection) => {
    setSelectedItem(item)
    setShowDeleteModal(true)
  }

  const handleSave = async () => {
    if (!form.description.trim()) { setError('Description is required'); return }
    if (!form.inspectionType.trim()) { setError('Inspection type is required'); return }
    setSaving(true)
    setError(null)
    try {
      const companyId = getCompanyId()
      const token = getToken()
      const baseUrl = `${process.env.NEXT_PUBLIC_API_URL}/companies/${companyId}/pre-inspections`
      const isEdit = !!selectedItem
      const url = isEdit ? `${baseUrl}/${selectedItem!.id}` : baseUrl
      const res = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          description: form.description,
          category: form.category || null,
          inspectionType: form.inspectionType,
          isMandatory: form.isMandatory,
          isSupervisor: form.isSupervisor,
          sortOrder: form.sortOrder,
          isActive: form.isActive
        })
      })
      if (!res.ok) throw new Error(await res.text() || 'Failed to save')
      setShowModal(false)
      await fetchData()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedItem) return
    setSaving(true)
    try {
      const companyId = getCompanyId()
      const token = getToken()
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/companies/${companyId}/pre-inspections/${selectedItem.id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )
      if (!res.ok) throw new Error('Failed to delete')
      setShowDeleteModal(false)
      await fetchData()
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const columns: ColumnDef<PreInspection>[] = [
    {
      header: '#',
      cell: ({ row }) => (page - 1) * pageSize + row.index + 1,
      size: 50
    },
    { accessorKey: 'description', header: 'Description' },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }) => row.original.category ?? '-'
    },
    { accessorKey: 'inspectionType', header: 'Inspection Type' },
    {
      accessorKey: 'isMandatory',
      header: 'Mandatory',
      cell: ({ row }) => (
        <Badge bg={row.original.isMandatory ? 'danger' : 'secondary'}>
          {row.original.isMandatory ? 'Yes' : 'No'}
        </Badge>
      )
    },
    {
      accessorKey: 'isSupervisor',
      header: 'Supervisor',
      cell: ({ row }) => (
        <Badge bg={row.original.isSupervisor ? 'warning' : 'secondary'}>
          {row.original.isSupervisor ? 'Yes' : 'No'}
        </Badge>
      )
    },
    { accessorKey: 'sortOrder', header: 'Sort Order' },
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
            <LuShieldCheck /> Pre Inspections ({totalCount})
          </h6>
          <Button size="sm" variant="primary" onClick={openCreate}>
            <LuPlus className="me-1" />Add Pre Inspection
          </Button>
        </div>

        <div className="card-body p-3">
          {/* Filters */}
          <Row className="g-2 mb-3 align-items-center">
            <Col xs={12} md={3}>
              <Form.Control size="sm" type="text" placeholder="Description"
                value={description}
                onChange={e => setDescription(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()} />
            </Col>
            <Col xs={12} md={3}>
              <Form.Control size="sm" type="text" placeholder="Category"
                value={category}
                onChange={e => setCategory(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()} />
            </Col>
            <Col xs={12} md={3}>
              <Form.Select size="sm" value={inspectionType}
                onChange={e => setInspectionType(e.target.value)}>
                <option value="">All Inspection Types</option>
                <option value="PRE">Pre Trip</option>
                <option value="POST">Post Trip</option>
                <option value="INTERIM">Interim</option>
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
                      No pre inspections found
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
          <Modal.Title>{selectedItem ? 'Edit Pre Inspection' : 'Add Pre Inspection'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <div className="alert alert-danger py-2 mb-3">{error}</div>}
          <FormGroup className="mb-3">
            <FormLabel>Description <span className="text-danger">*</span></FormLabel>
            <FormControl size="sm" type="text" placeholder="e.g. Check tyre pressure"
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })} />
          </FormGroup>
          <FormGroup className="mb-3">
            <FormLabel>Category</FormLabel>
            <FormControl size="sm" type="text" placeholder="e.g. Tyres, Brakes, Lights"
              value={form.category}
              onChange={e => setForm({ ...form, category: e.target.value })} />
          </FormGroup>
          <FormGroup className="mb-3">
            <FormLabel>Inspection Type <span className="text-danger">*</span></FormLabel>
            <Form.Select size="sm" value={form.inspectionType}
              onChange={e => setForm({ ...form, inspectionType: e.target.value })}>
              <option value="">Select type...</option>
              <option value="PRE">Pre Trip</option>
              <option value="POST">Post Trip</option>
              <option value="INTERIM">Interim</option>
            </Form.Select>
          </FormGroup>
          <FormGroup className="mb-3">
            <FormLabel>Sort Order</FormLabel>
            <FormControl size="sm" type="number" min={0}
              value={form.sortOrder}
              onChange={e => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })} />
          </FormGroup>
          <Row>
            <Col>
              <FormGroup className="mb-3">
                <FormCheck type="switch" label="Mandatory"
                  checked={form.isMandatory}
                  onChange={e => setForm({ ...form, isMandatory: e.target.checked })} />
              </FormGroup>
            </Col>
            <Col>
              <FormGroup className="mb-3">
                <FormCheck type="switch" label="Supervisor Only"
                  checked={form.isSupervisor}
                  onChange={e => setForm({ ...form, isSupervisor: e.target.checked })} />
              </FormGroup>
            </Col>
            <Col>
              <FormGroup>
                <FormCheck type="switch" label="Active"
                  checked={form.isActive}
                  onChange={e => setForm({ ...form, isActive: e.target.checked })} />
              </FormGroup>
            </Col>
          </Row>
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
          <Modal.Title>Delete Pre Inspection</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete <strong>{selectedItem?.description}</strong>?
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