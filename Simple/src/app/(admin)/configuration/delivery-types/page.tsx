'use client';

import { useState, useEffect, useCallback } from 'react';
import { flexRender, getCoreRowModel, useReactTable, type ColumnDef } from '@tanstack/react-table';
import { Container, Form, Button, Row, Col, Modal, FormGroup, FormLabel, FormControl } from 'react-bootstrap';
import { LuSearch, LuRefreshCw, LuPlus, LuPencil, LuTrash2, LuFileText } from 'react-icons/lu';
import deliveryTypeService, { type DeliveryType } from '@/services/deliveryTypeService';
import { getCompanyId } from '@/helpers/config';

interface DeliveryTypeForm {
  id: number
  description: string
}

const defaultForm: DeliveryTypeForm = { id: 0, description: '' }

const Page = () => {
  const [data, setData] = useState<DeliveryType[]>([])
  const [allData, setAllData] = useState<DeliveryType[]>([])
  const [loading, setLoading] = useState(false)
  const [totalCount, setTotalCount] = useState(0)
  const [page, setPage] = useState(1)
  const pageSize = 10
  const [totalPages, setTotalPages] = useState(0)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState<DeliveryType | null>(null)
  const [form, setForm] = useState<DeliveryTypeForm>(defaultForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const applyFiltersAndPaginate = (all: DeliveryType[], s: string, currentPage: number) => {
    let result = [...all]
    if (s) result = result.filter(d =>
      d.description.toLowerCase().includes(s.toLowerCase()) ||
      d.id.toString().includes(s)
    )
    setTotalCount(result.length)
    setTotalPages(Math.ceil(result.length / pageSize) || 1)
    const start = (currentPage - 1) * pageSize
    setData(result.slice(start, start + pageSize))
  }

  const fetchData = useCallback(async () => {
    const companyId = getCompanyId()
    setLoading(true)
    try {
      const result = await deliveryTypeService.getAll(companyId)
      setAllData(result)
      applyFiltersAndPaginate(result, '', 1)
    } catch (err) {
      console.error('Fetch error:', err)
      setData([])
      setAllData([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const handleSearch = () => { setPage(1); applyFiltersAndPaginate(allData, search, 1) }
  const handleReset = () => { setSearch(''); setPage(1); applyFiltersAndPaginate(allData, '', 1) }
  const handlePageChange = (p: number) => { setPage(p); applyFiltersAndPaginate(allData, search, p) }

  const openCreate = () => {
    setSelectedItem(null)
    setForm(defaultForm)
    setError(null)
    setShowModal(true)
  }

  const openEdit = (item: DeliveryType) => {
    setSelectedItem(item)
    setForm({ id: item.id, description: item.description })
    setError(null)
    setShowModal(true)
  }

  const openDelete = (item: DeliveryType) => {
    setSelectedItem(item)
    setShowDeleteModal(true)
  }

  const handleSave = async () => {
    if (!form.description.trim()) { setError('Description is required'); return }
    if (!selectedItem && form.id <= 0) { setError('ID must be greater than 0'); return }
    setSaving(true)
    setError(null)
    try {
      const companyId = getCompanyId()
      if (selectedItem) {
        await deliveryTypeService.update(companyId, selectedItem.id, { description: form.description })
      } else {
        await deliveryTypeService.create(companyId, { id: form.id, description: form.description })
      }
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
      await deliveryTypeService.delete(companyId, selectedItem.id)
      setShowDeleteModal(false)
      await fetchData()
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const columns: ColumnDef<DeliveryType>[] = [
    { header: '#', cell: ({ row }) => (page - 1) * pageSize + row.index + 1, size: 50 },
    { accessorKey: 'id', header: 'ID' },
    { accessorKey: 'description', header: 'Description' },
    {
      id: 'actions', header: 'Actions',
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
            <LuFileText /> Delivery Types ({totalCount})
          </h6>
          <Button size="sm" variant="primary" onClick={openCreate}>
            <LuPlus className="me-1" />Add Delivery Type
          </Button>
        </div>

        <div className="card-body p-3">
          <Row className="g-2 mb-3 align-items-center">
            <Col xs={12} md={8}>
              <Form.Control size="sm" type="text" placeholder="Search by ID or description..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()} />
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
                      No delivery types found
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
          <Modal.Title>{selectedItem ? 'Edit Delivery Type' : 'Add Delivery Type'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <div className="alert alert-danger py-2 mb-3">{error}</div>}
          {!selectedItem && (
            <FormGroup className="mb-3">
              <FormLabel>ID <span className="text-danger">*</span></FormLabel>
              <FormControl size="sm" type="number" min={1}
                value={form.id}
                onChange={e => setForm({ ...form, id: parseInt(e.target.value) || 0 })} />
            </FormGroup>
          )}
          <FormGroup className="mb-3">
            <FormLabel>Description <span className="text-danger">*</span></FormLabel>
            <FormControl size="sm" type="text" placeholder="e.g. Standard Delivery"
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })} />
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
          <Modal.Title>Delete Delivery Type</Modal.Title>
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