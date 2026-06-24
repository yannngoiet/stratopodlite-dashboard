'use client'

import { useState, useEffect, useCallback } from 'react'
import { flexRender, getCoreRowModel, getSortedRowModel, useReactTable, type ColumnDef, type SortingState } from '@tanstack/react-table'
import { Badge, Container, Form, Modal } from 'react-bootstrap'
import { ArrowUp, ArrowDown, ArrowUpDown, Search, RotateCcw } from 'lucide-react'
import { LuPlus, LuPencil, LuTrash2, LuShieldCheck } from 'react-icons/lu'
import { Button } from '@/components/ui/button'
import preInspectionService, { type PreInspection } from '@/services/preInspectionService'
import { getCompanyId } from '@/helpers/config'

interface PreInspectionForm {
  description: string; category: string; inspectionType: string
  isMandatory: boolean; isSupervisor: boolean; sortOrder: number; isActive: boolean
}

const defaultForm: PreInspectionForm = {
  description: '', category: '', inspectionType: '',
  isMandatory: false, isSupervisor: false, sortOrder: 0, isActive: true
}

const formatDate = (date: string) =>
  new Date(date).toLocaleString('en-ZA', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
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

const Page = () => {
  const [data, setData]           = useState<PreInspection[]>([])
  const [allData, setAllData]     = useState<PreInspection[]>([])
  const [loading, setLoading]     = useState(false)
  const [totalCount, setTotalCount] = useState(0)
  const [page, setPage]           = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [sorting, setSorting]     = useState<SortingState>([])
  const [description, setDescription]     = useState('')
  const [category, setCategory]           = useState('')
  const [inspectionType, setInspectionType] = useState('')
  const [showModal, setShowModal]           = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedItem, setSelectedItem]     = useState<PreInspection | null>(null)
  const [form, setForm]           = useState<PreInspectionForm>(defaultForm)
  const [saving, setSaving]       = useState(false)
  const [error, setError]         = useState<string | null>(null)
  const pageSize = 10

  const applyFiltersAndPaginate = (all: PreInspection[], desc: string, cat: string, type: string, currentPage: number) => {
    let result = [...all]
    if (desc) result = result.filter(p => p.description.toLowerCase().includes(desc.toLowerCase()))
    if (cat)  result = result.filter(p => p.category?.toLowerCase().includes(cat.toLowerCase()))
    if (type) result = result.filter(p => p.inspectionType.toLowerCase().includes(type.toLowerCase()))
    setTotalCount(result.length)
    setTotalPages(Math.ceil(result.length / pageSize) || 1)
    const start = (currentPage - 1) * pageSize
    setData(result.slice(start, start + pageSize))
  }

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const companyId = getCompanyId()
      const result = await preInspectionService.getAll(companyId)
      setAllData(result)
      applyFiltersAndPaginate(result, '', '', '', 1)
    } catch (err) {
      console.error(err); setData([]); setAllData([])
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const handleSearch     = () => { setPage(1); applyFiltersAndPaginate(allData, description, category, inspectionType, 1) }
  const handleReset      = () => { setDescription(''); setCategory(''); setInspectionType(''); setPage(1); applyFiltersAndPaginate(allData, '', '', '', 1) }
  const handlePageChange = (p: number) => { setPage(p); applyFiltersAndPaginate(allData, description, category, inspectionType, p) }

  const openCreate = () => { setSelectedItem(null); setForm(defaultForm); setError(null); setShowModal(true) }
  const openEdit   = (item: PreInspection) => {
    setSelectedItem(item)
    setForm({ description: item.description, category: item.category ?? '', inspectionType: item.inspectionType, isMandatory: item.isMandatory, isSupervisor: item.isSupervisor, sortOrder: item.sortOrder, isActive: item.isActive })
    setError(null); setShowModal(true)
  }
  const openDelete = (item: PreInspection) => { setSelectedItem(item); setShowDeleteModal(true) }

  const handleSave = async () => {
    if (!form.description.trim())   { setError('Description is required'); return }
    if (!form.inspectionType.trim()) { setError('Inspection type is required'); return }
    setSaving(true); setError(null)
    try {
      const companyId = getCompanyId()
      const payload = { description: form.description, category: form.category || null, inspectionType: form.inspectionType, isMandatory: form.isMandatory, isSupervisor: form.isSupervisor, sortOrder: form.sortOrder, isActive: form.isActive }
      if (selectedItem) await preInspectionService.update(companyId, selectedItem.id, payload)
      else await preInspectionService.create(companyId, payload)
      setShowModal(false); await fetchData()
    } catch (err: any) { setError(err.message) }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!selectedItem) return
    setSaving(true)
    try {
      const companyId = getCompanyId()
      await preInspectionService.delete(companyId, selectedItem.id)
      setShowDeleteModal(false); await fetchData()
    } catch (err) { console.error(err) }
    finally { setSaving(false) }
  }

  const columns: ColumnDef<PreInspection>[] = [
    { header: '#', size: 50, cell: ({ row }) => <span className="dash-cell-muted">{(page - 1) * pageSize + row.index + 1}</span> },
    { accessorKey: 'description',   header: ({ column }) => <SortHeader column={column} label="Description" /> },
    { accessorKey: 'category',      header: ({ column }) => <SortHeader column={column} label="Category" />,      cell: ({ row }) => <span className="dash-cell-muted">{row.original.category ?? '—'}</span> },
    { accessorKey: 'inspectionType', header: ({ column }) => <SortHeader column={column} label="Inspection Type" />, cell: ({ row }) => <span className="dash-cell-muted">{row.original.inspectionType}</span> },
    { accessorKey: 'isMandatory',   header: ({ column }) => <SortHeader column={column} label="Mandatory" />,     cell: ({ row }) => <Badge bg={row.original.isMandatory ? 'danger' : 'secondary'}>{row.original.isMandatory ? 'Yes' : 'No'}</Badge> },
    { accessorKey: 'isSupervisor',  header: ({ column }) => <SortHeader column={column} label="Supervisor" />,    cell: ({ row }) => <Badge bg={row.original.isSupervisor ? 'warning' : 'secondary'}>{row.original.isSupervisor ? 'Yes' : 'No'}</Badge> },
    { accessorKey: 'sortOrder',     header: ({ column }) => <SortHeader column={column} label="Sort Order" />,    cell: ({ row }) => <span className="dash-cell-muted">{row.original.sortOrder}</span> },
    { accessorKey: 'isActive',      header: ({ column }) => <SortHeader column={column} label="Status" />,        cell: ({ row }) => <Badge bg={row.original.isActive ? 'success' : 'danger'}>{row.original.isActive ? 'Active' : 'Inactive'}</Badge> },
    { accessorKey: 'updatedAt',     header: ({ column }) => <SortHeader column={column} label="Updated" />,       cell: ({ row }) => <span className="dash-cell-muted">{formatDate(row.original.updatedAt)}</span> },
    {
      id: 'actions', header: 'Actions',
      cell: ({ row }) => (
        <div className="flex gap-1">
          <Button size="sm" variant="outline" className="rounded-md px-2 !border-slate-300" onClick={() => openEdit(row.original)}><LuPencil size={11} /></Button>
          <Button size="sm" variant="outline" className="rounded-md px-2 btn-outline-red"   onClick={() => openDelete(row.original)}><LuTrash2 size={11} /></Button>
        </div>
      )
    }
  ]

  const table = useReactTable({
    data: data ?? [], columns,
    state: { sorting }, onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(), getSortedRowModel: getSortedRowModel(),
    manualPagination: true, pageCount: totalPages,
  })

  const start = totalCount === 0 ? 0 : (page - 1) * pageSize + 1
  const end   = Math.min(page * pageSize, totalCount)

  return (
    <Container fluid className="py-3">
      <div className="card shadow-sm">
        <div className="card-header d-flex justify-content-between align-items-center py-2">
          <h6 className="mb-0 fw-semibold d-flex align-items-center gap-2">
            <LuShieldCheck size={15} /> Pre Inspections ({totalCount})
          </h6>
          <Button size="sm" onClick={openCreate} className="flex items-center gap-1.5 btn-navy rounded-md">
            <LuPlus size={13} /> Add Pre Inspection
          </Button>
        </div>

        <div className="card-body p-3">
          {/* Filters */}
          <div className="dash-filter-bar mb-3">
            <input placeholder="Description" value={description}
              onChange={e => setDescription(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()}
              className="dash-filter-input" />
            <input placeholder="Category" value={category}
              onChange={e => setCategory(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()}
              className="dash-filter-input" />
            <select value={inspectionType} onChange={e => setInspectionType(e.target.value)} className="dash-filter-input">
              <option value="">All Inspection Types</option>
              <option value="PRE_TRIP">Pre Trip</option>
              <option value="POST_TRIP">Post Trip</option>
              <option value="ROADSIDE">Roadside</option>
              <option value="ANNUAL">Annual</option>
              <option value="INCIDENT">Incident</option>
            </select>
            <Button size="sm" onClick={handleSearch} disabled={loading}
              className="flex items-center gap-1.5 whitespace-nowrap btn-blue rounded-md">
              <Search size={13} /> Search
            </Button>
            <Button size="sm" variant="outline" onClick={handleReset} disabled={loading}
              className="flex items-center gap-1.5 whitespace-nowrap rounded-md">
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
                    <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div>
                  </td></tr>
                ) : table.getRowModel().rows.length === 0 ? (
                  <tr><td colSpan={columns.length} className="text-center py-4 text-muted">No pre inspections found</td></tr>
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
              {totalCount > 0 ? `Showing ${start} to ${end} of ${totalCount} entries` : 'No entries found'}
            </small>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" disabled={page === 1 || loading} onClick={() => handlePageChange(1)} className="rounded-md px-2">«</Button>
              <Button variant="outline" size="sm" disabled={page === 1 || loading} onClick={() => handlePageChange(page - 1)} className="rounded-md px-2">‹</Button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const p = Math.max(1, page - 2) + i
                if (p > totalPages) return null
                return (
                  <Button key={p} size="sm" onClick={() => handlePageChange(p)}
                    className={`rounded-md px-2 ${p === page ? 'btn-navy' : ''}`}
                    variant={p === page ? 'default' : 'outline'}>{p}</Button>
                )
              })}
              <Button variant="outline" size="sm" disabled={page >= totalPages || loading} onClick={() => handlePageChange(page + 1)} className="rounded-md px-2">›</Button>
              <Button variant="outline" size="sm" disabled={page >= totalPages || loading} onClick={() => handlePageChange(totalPages)} className="rounded-md px-2">»</Button>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
        <Modal.Header closeButton className="modal-header-dark">
          <Modal.Title style={{ fontSize: 15, fontWeight: 600 }}>
            {selectedItem ? 'Edit Pre Inspection' : 'Add Pre Inspection'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {error && <div className="alert alert-danger py-2 mb-3" style={{ fontSize: 13 }}>{error}</div>}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1 col-span-2">
              <label className="field-label">Description <span className="text-red-500">*</span></label>
              <input className="dash-filter-input" placeholder="e.g. Check tyre pressure"
                value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="field-label">Category</label>
              <input className="dash-filter-input" placeholder="e.g. Tyres, Brakes"
                value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="field-label">Inspection Type <span className="text-red-500">*</span></label>
              <select className="dash-filter-input" value={form.inspectionType}
                onChange={e => setForm({ ...form, inspectionType: e.target.value })}>
                <option value="">Select type...</option>
                <option value="PRE_TRIP">Pre Trip</option>
                <option value="POST_TRIP">Post Trip</option>
                <option value="ROADSIDE">Roadside</option>
                <option value="ANNUAL">Annual</option>
                <option value="INCIDENT">Incident</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="field-label">Sort Order</label>
              <input className="dash-filter-input" type="number" min={0}
                value={form.sortOrder} onChange={e => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })} />
            </div>
            <div className="flex items-center gap-6 pt-4">
              <div className="flex items-center gap-2">
                <Form.Check type="switch" id="mandatory-switch" checked={form.isMandatory}
                  onChange={e => setForm({ ...form, isMandatory: e.target.checked })} />
                <label htmlFor="mandatory-switch" className="field-label mb-0" style={{ cursor: 'pointer' }}>Mandatory</label>
              </div>
              <div className="flex items-center gap-2">
                <Form.Check type="switch" id="supervisor-switch" checked={form.isSupervisor}
                  onChange={e => setForm({ ...form, isSupervisor: e.target.checked })} />
                <label htmlFor="supervisor-switch" className="field-label mb-0" style={{ cursor: 'pointer' }}>Supervisor Only</label>
              </div>
              <div className="flex items-center gap-2">
                <Form.Check type="switch" id="active-switch" checked={form.isActive}
                  onChange={e => setForm({ ...form, isActive: e.target.checked })} />
                <label htmlFor="active-switch" className="field-label mb-0" style={{ cursor: 'pointer' }}>Active</label>
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer style={{ borderTop: '1px solid #dde3f0', padding: '0.75rem 1.25rem' }}>
          <Button size="sm" variant="outline" className="rounded-md px-4" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button size="sm" disabled={saving} className="rounded-md px-4 btn-navy" onClick={handleSave}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered size="sm">
        <Modal.Header closeButton className="modal-header-dark">
          <Modal.Title style={{ fontSize: 15, fontWeight: 600 }}>Delete Pre Inspection</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          Are you sure you want to delete <strong>{selectedItem?.description}</strong>?
        </Modal.Body>
        <Modal.Footer style={{ borderTop: '1px solid #dde3f0', padding: '0.75rem 1.25rem' }}>
          <Button size="sm" variant="outline" className="rounded-md px-4" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
          <Button size="sm" disabled={saving} className="rounded-md px-4 btn-outline-red" onClick={handleDelete}>
            {saving ? 'Deleting...' : 'Delete'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  )
}

export default Page
