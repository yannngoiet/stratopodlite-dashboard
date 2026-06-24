'use client'

import { useState, useEffect, useCallback } from 'react'
import { flexRender, getCoreRowModel, getSortedRowModel, useReactTable, type ColumnDef, type SortingState } from '@tanstack/react-table'
import { Container, Modal } from 'react-bootstrap'
import { ArrowUp, ArrowDown, ArrowUpDown, Search, RotateCcw } from 'lucide-react'
import { LuPlus, LuPencil, LuTrash2, LuTag } from 'react-icons/lu'
import { Button } from '@/components/ui/button'
import statusCodeService, { type StatusCode } from '@/services/statusCodeService'
import { getCompanyId } from '@/helpers/config'

interface StatusCodeForm { id: number; description: string }
const defaultForm: StatusCodeForm = { id: 0, description: '' }

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
  const [data, setData]             = useState<StatusCode[]>([])
  const [allData, setAllData]       = useState<StatusCode[]>([])
  const [loading, setLoading]       = useState(false)
  const [totalCount, setTotalCount] = useState(0)
  const [page, setPage]             = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [search, setSearch]         = useState('')
  const [sorting, setSorting]       = useState<SortingState>([])
  const [showModal, setShowModal]   = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedItem, setSelectedItem]       = useState<StatusCode | null>(null)
  const [form, setForm]             = useState<StatusCodeForm>(defaultForm)
  const [saving, setSaving]         = useState(false)
  const [error, setError]           = useState<string | null>(null)
  const pageSize = 15

  const applyFiltersAndPaginate = (all: StatusCode[], s: string, currentPage: number) => {
    let result = [...all]
    if (s) result = result.filter(d =>
      d.description.toLowerCase().includes(s.toLowerCase()) || d.id.toString().includes(s))
    setTotalCount(result.length)
    setTotalPages(Math.ceil(result.length / pageSize) || 1)
    const start = (currentPage - 1) * pageSize
    setData(result.slice(start, start + pageSize))
  }

  const fetchData = useCallback(async () => {
    const companyId = getCompanyId()
    setLoading(true)
    try {
      const result = await statusCodeService.getAll(companyId)
      setAllData(result)
      applyFiltersAndPaginate(result, '', 1)
    } catch (err) {
      console.error(err); setData([]); setAllData([])
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const handleSearch     = () => { setPage(1); applyFiltersAndPaginate(allData, search, 1) }
  const handleReset      = () => { setSearch(''); setPage(1); applyFiltersAndPaginate(allData, '', 1) }
  const handlePageChange = (p: number) => { setPage(p); applyFiltersAndPaginate(allData, search, p) }

  const openCreate = () => { setSelectedItem(null); setForm(defaultForm); setError(null); setShowModal(true) }
  const openEdit   = (item: StatusCode) => { setSelectedItem(item); setForm({ id: item.id, description: item.description }); setError(null); setShowModal(true) }
  const openDelete = (item: StatusCode) => { setSelectedItem(item); setShowDeleteModal(true) }

  const handleSave = async () => {
    if (!form.description.trim()) { setError('Description is required'); return }
    if (!selectedItem && form.id <= 0) { setError('ID must be greater than 0'); return }
    setSaving(true); setError(null)
    try {
      const companyId = getCompanyId()
      if (selectedItem) await statusCodeService.update(companyId, selectedItem.id, { description: form.description })
      else await statusCodeService.create(companyId, { id: form.id, description: form.description })
      setShowModal(false); await fetchData()
    } catch (err: any) { setError(err.message) }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!selectedItem) return
    setSaving(true)
    try {
      const companyId = getCompanyId()
      await statusCodeService.delete(companyId, selectedItem.id)
      setShowDeleteModal(false); await fetchData()
    } catch (err) { console.error(err) }
    finally { setSaving(false) }
  }

  const columns: ColumnDef<StatusCode>[] = [
    { header: '#', size: 50, cell: ({ row }) => <span className="dash-cell-muted">{(page - 1) * pageSize + row.index + 1}</span> },
    { accessorKey: 'id',          header: ({ column }) => <SortHeader column={column} label="ID" />,          cell: ({ row }) => <span className="dash-cell-muted">{row.original.id}</span> },
    { accessorKey: 'description', header: ({ column }) => <SortHeader column={column} label="Description" />, cell: ({ row }) => row.original.description },
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
            <LuTag size={15} /> Status Codes ({totalCount})
          </h6>
          <Button size="sm" onClick={openCreate} className="flex items-center gap-1.5 btn-navy rounded-md">
            <LuPlus size={13} /> Add Status Code
          </Button>
        </div>

        <div className="card-body p-3">
          {/* Filters */}
          <div className="dash-filter-bar mb-3">
            <input placeholder="Search by ID or description..." value={search}
              onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()}
              className="dash-filter-input" />
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
                  <tr><td colSpan={columns.length} className="text-center py-4 text-muted">No status codes found</td></tr>
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
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton className="modal-header-dark">
          <Modal.Title style={{ fontSize: 15, fontWeight: 600 }}>
            {selectedItem ? 'Edit Status Code' : 'Add Status Code'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {error && <div className="alert alert-danger py-2 mb-3" style={{ fontSize: 13 }}>{error}</div>}
          <div className="flex flex-col gap-4">
            {!selectedItem && (
              <div className="flex flex-col gap-1">
                <label className="field-label">ID <span className="text-red-500">*</span></label>
                <input className="dash-filter-input" type="number" min={1}
                  value={form.id || ''}
                  onChange={e => setForm({ ...form, id: parseInt(e.target.value) || 0 })} />
              </div>
            )}
            <div className="flex flex-col gap-1">
              <label className="field-label">Description <span className="text-red-500">*</span></label>
              <input className="dash-filter-input" placeholder="e.g. Available"
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })} />
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
          <Modal.Title style={{ fontSize: 15, fontWeight: 600 }}>Delete Status Code</Modal.Title>
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
