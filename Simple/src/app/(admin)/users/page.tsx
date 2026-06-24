'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  flexRender, getCoreRowModel, getSortedRowModel,
  useReactTable, type ColumnDef, type SortingState
} from '@tanstack/react-table'
import { Container, Badge, Modal, Form } from 'react-bootstrap'
import { ArrowUp, ArrowDown, ArrowUpDown, Search, RotateCcw } from 'lucide-react'
import { LuDownload, LuPlus, LuTrash2, LuUsers } from 'react-icons/lu'
import { Button } from '@/components/ui/button'
import * as XLSX from 'xlsx'
import userManagementService, { type ManagedUser } from '@/services/userManagementService'

const formatDate = (val: string | null) =>
  val ? new Date(val).toLocaleString('en-ZA', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  }) : '—'

const defaultForm = {
  firstName: '', lastName: '', username: '', email: '',
  password: '', phoneNumber: '', plantId: '',
  isSuperAdmin: false, isActive: true
}

const SortHeader = ({ column, label }: { column: any; label: string }) => (
  <button className="dash-sort-btn-dark"
    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
    {label}
    {column.getIsSorted() === 'asc'  ? <ArrowUp size={12} /> :
     column.getIsSorted() === 'desc' ? <ArrowDown size={12} /> :
     <ArrowUpDown size={12} className="dash-sort-icon-neutral" />}
  </button>
)

export default function UsersPage() {
  const [data, setData]         = useState<ManagedUser[]>([])
  const [loading, setLoading]   = useState(false)
  const [filterUsername, setFilterUsername] = useState('')
  const [filterFullName, setFilterFullName] = useState('')
  const [filterEmail,    setFilterEmail]    = useState('')
  const [filterPhone,    setFilterPhone]    = useState('')
  const [statusFilter,   setStatusFilter]   = useState('')
  const [sorting, setSorting]   = useState<SortingState>([])

  const [showModal, setShowModal]           = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedUser, setSelectedUser]     = useState<ManagedUser | null>(null)
  const [form, setForm]         = useState(defaultForm)
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState<string | null>(null)

  const fetchData = useCallback(async (active: string) => {
    setLoading(true)
    try {
      const result = await userManagementService.getAll({
        isActive: active === '' ? undefined : active === 'true'
      })
      setData(result)
    } catch (err) {
      console.error(err)
      setData([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData('') }, [fetchData])

  const filteredData = useMemo(() => {
    return data.filter(u => {
      const fullName = `${u.firstName} ${u.lastName}`.toLowerCase()
      if (filterUsername && !u.username.toLowerCase().includes(filterUsername.toLowerCase())) return false
      if (filterFullName && !fullName.includes(filterFullName.toLowerCase())) return false
      if (filterEmail    && !u.email.toLowerCase().includes(filterEmail.toLowerCase())) return false
      if (filterPhone    && !(u.phoneNumber ?? '').toLowerCase().includes(filterPhone.toLowerCase())) return false
      if (statusFilter   && String(u.isActive) !== statusFilter) return false
      return true
    })
  }, [data, filterUsername, filterFullName, filterEmail, filterPhone, statusFilter])

  const handleSearch = () => fetchData(statusFilter)
  const handleReset  = () => {
    setFilterUsername(''); setFilterFullName(''); setFilterEmail(''); setFilterPhone(''); setStatusFilter('')
    fetchData('')
  }

  const handleSave = async () => {
    if (!form.firstName.trim()) { setError('First name is required'); return }
    if (!form.lastName.trim())  { setError('Last name is required'); return }
    if (!form.username.trim())  { setError('Username is required'); return }
    if (!form.email.trim())     { setError('Email is required'); return }
    if (!form.password.trim())  { setError('Password is required'); return }

    setSaving(true); setError(null)
    try {
      await userManagementService.create({
        firstName:    form.firstName,
        lastName:     form.lastName,
        username:     form.username,
        email:        form.email,
        password:     form.password,
        phoneNumber:  form.phoneNumber || null,
        plantId:      form.plantId || null,
        isSuperAdmin: form.isSuperAdmin,
      })
      setShowModal(false)
      setForm(defaultForm)
      await fetchData(statusFilter)
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Failed to create user')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedUser) return
    setSaving(true)
    try {
      await userManagementService.delete(selectedUser.id)
      setShowDeleteModal(false)
      setSelectedUser(null)
      await fetchData(statusFilter)
    } catch (err) { console.error(err) }
    finally { setSaving(false) }
  }

  const handleExportExcel = () => {
    const rows = data.map((u, i) => ({
      '#':           i + 1,
      'Username':    u.username,
      'Full Name':   `${u.firstName} ${u.lastName}`,
      'Email':       u.email,
      'Phone':       u.phoneNumber ?? '—',
      'Plant':       u.plantId ?? '—',
      'Super Admin': u.isSuperAdmin ? 'Yes' : 'No',
      'Status':      u.isActive ? 'Active' : 'Inactive',
      'Last Login':  formatDate(u.lastLoginAt),
      'Created':     formatDate(u.createdAt),
    }))
    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Users')
    XLSX.writeFile(wb, `Users_${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  const columns: ColumnDef<ManagedUser>[] = [
    {
      header: '#', size: 50,
      cell: ({ row }) => <span className="dash-cell-muted">{row.index + 1}</span>
    },
    {
      accessorKey: 'username',
      header: ({ column }) => <SortHeader column={column} label="Username" />,
      cell: ({ row }) => <span className="dash-text-navy">{row.original.username}</span>
    },
    {
      id: 'fullName',
      header: ({ column }) => <SortHeader column={column} label="Full Name" />,
      accessorFn: row => `${row.firstName} ${row.lastName}`,
      cell: ({ row }) => `${row.original.firstName} ${row.original.lastName}`
    },
    {
      accessorKey: 'email',
      header: ({ column }) => <SortHeader column={column} label="Email" />,
      cell: ({ row }) => <span className="dash-cell-muted">{row.original.email}</span>
    },
    {
      accessorKey: 'phoneNumber',
      header: ({ column }) => <SortHeader column={column} label="Phone" />,
      cell: ({ row }) => <span className="dash-cell-muted">{row.original.phoneNumber ?? '—'}</span>
    },
    {
      accessorKey: 'plantId',
      header: ({ column }) => <SortHeader column={column} label="Plant" />,
      cell: ({ row }) => <span className="dash-cell-muted">{row.original.plantId ?? '—'}</span>
    },
    {
      accessorKey: 'isSuperAdmin',
      header: ({ column }) => <SortHeader column={column} label="Super Admin" />,
      cell: ({ row }) => (
        <Badge bg={row.original.isSuperAdmin ? 'danger' : 'secondary'}>
          {row.original.isSuperAdmin ? 'Yes' : 'No'}
        </Badge>
      )
    },
    {
      accessorKey: 'isActive',
      header: ({ column }) => <SortHeader column={column} label="Status" />,
      cell: ({ row }) => (
        <Badge bg={row.original.isActive ? 'success' : 'danger'}>
          {row.original.isActive ? 'Active' : 'Inactive'}
        </Badge>
      )
    },
    {
      accessorKey: 'lastLoginAt',
      header: ({ column }) => <SortHeader column={column} label="Last Login" />,
      cell: ({ row }) => <span className="dash-cell-muted">{formatDate(row.original.lastLoginAt)}</span>
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => <SortHeader column={column} label="Created" />,
      cell: ({ row }) => <span className="dash-cell-muted">{formatDate(row.original.createdAt)}</span>
    },
    {
      id: 'actions', header: 'Actions',
      cell: ({ row }) => (
        <Button size="sm" variant="outline"
          className="rounded-md px-2 btn-outline-red"
          onClick={() => { setSelectedUser(row.original); setShowDeleteModal(true) }}>
          <LuTrash2 size={11} />
        </Button>
      )
    }
  ]

  const table = useReactTable({
    data: filteredData, columns,
    state:             { sorting },
    onSortingChange:   setSorting,
    getCoreRowModel:   getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <Container fluid className="py-3">
      <div className="card shadow-sm">
        <div className="card-header d-flex justify-content-between align-items-center py-2">
          <h6 className="mb-0 fw-semibold d-flex align-items-center gap-2">
            <LuUsers size={16} /> Users ({filteredData.length})
          </h6>
          <Button size="sm" onClick={() => { setForm(defaultForm); setError(null); setShowModal(true) }}
            className="flex items-center gap-1.5 btn-navy rounded-md">
            <LuPlus size={13} /> Add User
          </Button>
        </div>

        <div className="card-body p-3">
          {/* Filters */}
          <div className="dash-filter-bar mb-3">
            <input placeholder="Username" value={filterUsername}
              onChange={e => setFilterUsername(e.target.value)}
              className="dash-filter-input" />
            <input placeholder="Full Name" value={filterFullName}
              onChange={e => setFilterFullName(e.target.value)}
              className="dash-filter-input" />
            <input placeholder="Email" value={filterEmail}
              onChange={e => setFilterEmail(e.target.value)}
              className="dash-filter-input" />
            <input placeholder="Phone" value={filterPhone}
              onChange={e => setFilterPhone(e.target.value)}
              className="dash-filter-input" />
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              className="dash-filter-input">
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
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
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </td></tr>
                ) : table.getRowModel().rows.length === 0 ? (
                  <tr><td colSpan={columns.length} className="text-center py-4 text-muted">
                    No users found
                  </td></tr>
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

          <div className="mt-3">
            <small className="text-muted">
              {filteredData.length > 0 ? `Showing ${filteredData.length} entries` : 'No entries found'}
            </small>
          </div>
          <div className="flex justify-center mt-3">
            <Button size="sm" onClick={handleExportExcel} disabled={filteredData.length === 0}
              className="flex items-center gap-1.5 btn-green rounded-md">
              <LuDownload size={13} /> Export to Excel
            </Button>
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
        <Modal.Header closeButton className="modal-header-dark">
          <Modal.Title style={{ fontSize: 15, fontWeight: 600 }}>Add New User</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {error && <div className="alert alert-danger py-2 mb-3" style={{ fontSize: 13 }}>{error}</div>}
          <div className="grid grid-cols-2 gap-4">

            <div className="flex flex-col gap-1">
              <label className="field-label">First Name <span className="text-red-500">*</span></label>
              <input className="dash-filter-input" placeholder="John"
                value={form.firstName}
                onChange={e => setForm({ ...form, firstName: e.target.value })} />
            </div>

            <div className="flex flex-col gap-1">
              <label className="field-label">Last Name <span className="text-red-500">*</span></label>
              <input className="dash-filter-input" placeholder="Smith"
                value={form.lastName}
                onChange={e => setForm({ ...form, lastName: e.target.value })} />
            </div>

            <div className="flex flex-col gap-1">
              <label className="field-label">Username <span className="text-red-500">*</span></label>
              <input className="dash-filter-input" placeholder="jsmith"
                value={form.username}
                onChange={e => setForm({ ...form, username: e.target.value })} />
            </div>

            <div className="flex flex-col gap-1">
              <label className="field-label">Email <span className="text-red-500">*</span></label>
              <input className="dash-filter-input" type="email" placeholder="john@example.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>

            <div className="flex flex-col gap-1">
              <label className="field-label">Password <span className="text-red-500">*</span></label>
              <input className="dash-filter-input" type="password" placeholder="••••••••"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })} />
            </div>

            <div className="flex flex-col gap-1">
              <label className="field-label">Phone Number</label>
              <input className="dash-filter-input" placeholder="+27 82 000 0000"
                value={form.phoneNumber}
                onChange={e => setForm({ ...form, phoneNumber: e.target.value })} />
            </div>

            <div className="flex flex-col gap-1">
              <label className="field-label">Plant ID</label>
              <input className="dash-filter-input" placeholder="e.g. 1-HQ"
                value={form.plantId}
                onChange={e => setForm({ ...form, plantId: e.target.value })} />
            </div>

            <div className="flex items-center gap-2 pt-4">
              <Form.Check type="switch" id="super-admin-switch"
                checked={form.isSuperAdmin}
                onChange={e => setForm({ ...form, isSuperAdmin: e.target.checked })} />
              <label htmlFor="super-admin-switch" className="field-label mb-0" style={{ cursor: 'pointer' }}>
                Super Admin
              </label>
            </div>

          </div>
        </Modal.Body>
        <Modal.Footer style={{ borderTop: '1px solid #dde3f0', padding: '0.75rem 1.25rem' }}>
          <Button size="sm" variant="outline" onClick={() => setShowModal(false)}
            className="rounded-md px-4">Cancel</Button>
          <Button size="sm" disabled={saving} onClick={handleSave}
            className="rounded-md px-4 btn-navy">
            {saving ? 'Saving...' : 'Add User'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered size="sm">
        <Modal.Header closeButton className="modal-header-dark">
          <Modal.Title style={{ fontSize: 15, fontWeight: 600 }}>Delete User</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          Are you sure you want to delete <strong>{selectedUser?.username}</strong>?
        </Modal.Body>
        <Modal.Footer style={{ borderTop: '1px solid #dde3f0', padding: '0.75rem 1.25rem' }}>
          <Button size="sm" variant="outline" onClick={() => setShowDeleteModal(false)}
            className="rounded-md px-4">Cancel</Button>
          <Button size="sm" disabled={saving} onClick={handleDelete}
            className="rounded-md px-4 btn-outline-red">
            {saving ? 'Deleting...' : 'Delete'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  )
}
