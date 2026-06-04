'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  flexRender, getCoreRowModel, useReactTable, type ColumnDef
} from '@tanstack/react-table'
import { Container, Form, Button, Row, Col, Badge, Modal, FormGroup, FormLabel, FormControl, FormCheck } from 'react-bootstrap'
import { LuSearch, LuRefreshCw, LuPlus, LuTrash2, LuUsers } from 'react-icons/lu'
import userManagementService, { type ManagedUser } from '@/services/userManagementService'

const NAVY = '#2c3e50'

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

export default function UsersPage() {
  const [data, setData]         = useState<ManagedUser[]>([])
  const [loading, setLoading]   = useState(false)
  const [search, setSearch]     = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const [showModal, setShowModal]       = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<ManagedUser | null>(null)
  const [form, setForm]         = useState(defaultForm)
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState<string | null>(null)

  const fetchData = useCallback(async (s: string, active: string) => {
    setLoading(true)
    try {
      const result = await userManagementService.getAll({
        search:   s || undefined,
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

  useEffect(() => { fetchData('', '') }, [fetchData])

  const handleSearch = () => fetchData(search, statusFilter)
  const handleReset  = () => { setSearch(''); setStatusFilter(''); fetchData('', '') }

  const handleSave = async () => {
    if (!form.firstName.trim()) { setError('First name is required'); return }
    if (!form.lastName.trim())  { setError('Last name is required'); return }
    if (!form.username.trim())  { setError('Username is required'); return }
    if (!form.email.trim())     { setError('Email is required'); return }
    if (!form.password.trim())  { setError('Password is required'); return }

    setSaving(true); setError(null)
    try {
      await userManagementService.create({
        firstName:   form.firstName,
        lastName:    form.lastName,
        username:    form.username,
        email:       form.email,
        password:    form.password,
        phoneNumber: form.phoneNumber || null,
        plantId:     form.plantId || null,
        isSuperAdmin: form.isSuperAdmin,
      })
      setShowModal(false)
      setForm(defaultForm)
      await fetchData(search, statusFilter)
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
      await fetchData(search, statusFilter)
    } catch (err) { console.error(err) }
    finally { setSaving(false) }
  }

  const columns: ColumnDef<ManagedUser>[] = [
    {
      header: '#', size: 50,
      cell: ({ row }) => <span style={{ color: '#888', fontSize: 12 }}>{row.index + 1}</span>
    },
    {
      accessorKey: 'username', header: 'Username',
      cell: ({ row }) => <span style={{ fontWeight: 600, color: NAVY }}>{row.original.username}</span>
    },
    {
      id: 'fullName', header: 'Full Name',
      cell: ({ row }) => `${row.original.firstName} ${row.original.lastName}`
    },
    { accessorKey: 'email', header: 'Email' },
    {
      accessorKey: 'phoneNumber', header: 'Phone',
      cell: ({ row }) => row.original.phoneNumber ?? '—'
    },
    {
      accessorKey: 'plantId', header: 'Plant',
      cell: ({ row }) => row.original.plantId ?? '—'
    },
    {
      accessorKey: 'isSuperAdmin', header: 'Super Admin',
      cell: ({ row }) => (
        <Badge bg={row.original.isSuperAdmin ? 'danger' : 'secondary'} style={{ fontSize: 11 }}>
          {row.original.isSuperAdmin ? 'Yes' : 'No'}
        </Badge>
      )
    },
    {
      accessorKey: 'isActive', header: 'Status',
      cell: ({ row }) => (
        <Badge bg={row.original.isActive ? 'success' : 'danger'} style={{ fontSize: 11 }}>
          {row.original.isActive ? 'Active' : 'Inactive'}
        </Badge>
      )
    },
    {
      accessorKey: 'lastLoginAt', header: 'Last Login',
      cell: ({ row }) => <span style={{ fontSize: 12 }}>{formatDate(row.original.lastLoginAt)}</span>
    },
    {
      accessorKey: 'createdAt', header: 'Created',
      cell: ({ row }) => <span style={{ fontSize: 12 }}>{formatDate(row.original.createdAt)}</span>
    },
    {
      id: 'actions', header: 'Actions',
      cell: ({ row }) => (
        <Button size="sm" variant="outline-danger" style={{ padding: '2px 6px' }}
          onClick={() => { setSelectedUser(row.original); setShowDeleteModal(true) }}>
          <LuTrash2 size={11} />
        </Button>
      )
    }
  ]

  const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() })

  return (
    <Container fluid className="py-3">
      <div className="card shadow-sm">
        <div className="card-header d-flex justify-content-between align-items-center py-2"
          style={{ background: NAVY }}>
          <h6 className="mb-0 fw-semibold d-flex align-items-center gap-2" style={{ color: '#fff' }}>
            <LuUsers size={16} /> Users ({data.length})
          </h6>
          <Button size="sm" style={{ background: '#17a2b8', border: 'none', fontSize: 12 }}
            onClick={() => { setForm(defaultForm); setError(null); setShowModal(true) }}>
            <LuPlus size={13} className="me-1" />Add User
          </Button>
        </div>

        <div className="card-body p-3">
          <Row className="g-2 mb-3 align-items-center">
            <Col xs={12} md={4}>
              <Form.Control size="sm" type="text" placeholder="Search by name, username or email..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()} />
            </Col>
            <Col xs={12} md={3}>
              <Form.Select size="sm" value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}>
                <option value="">All Status</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
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

          <div className="table-responsive">
            <table className="table table-bordered table-striped table-hover table-sm align-middle mb-0"
              style={{ fontSize: 13 }}>
              <thead>
                {table.getHeaderGroups().map(hg => (
                  <tr key={hg.id}>
                    {hg.headers.map(h => (
                      <th key={h.id} className="py-2 px-3 text-uppercase"
                        style={{ background: NAVY, color: '#fff', fontSize: '0.72rem', fontWeight: 600 }}>
                        {flexRender(h.column.columnDef.header, h.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody style={{ fontSize: '0.85rem' }}>
                {loading ? (
                  <tr><td colSpan={columns.length} className="text-center py-5">
                    <div className="spinner-border text-primary" role="status" />
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

          <div className="mt-2">
            <small className="text-muted">
              {data.length > 0 ? `Showing ${data.length} entries` : 'No entries found'}
            </small>
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
        <Modal.Header closeButton style={{ background: NAVY, color: '#fff' }}>
          <Modal.Title style={{ fontSize: 15 }}>Add New User</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <div className="alert alert-danger py-2 mb-3">{error}</div>}
          <Row className="g-3">
            <Col md={6}>
              <FormLabel style={{ fontSize: 12 }}>First Name <span className="text-danger">*</span></FormLabel>
              <FormControl size="sm" placeholder="John"
                value={form.firstName}
                onChange={e => setForm({ ...form, firstName: e.target.value })} />
            </Col>
            <Col md={6}>
              <FormLabel style={{ fontSize: 12 }}>Last Name <span className="text-danger">*</span></FormLabel>
              <FormControl size="sm" placeholder="Smith"
                value={form.lastName}
                onChange={e => setForm({ ...form, lastName: e.target.value })} />
            </Col>
            <Col md={6}>
              <FormLabel style={{ fontSize: 12 }}>Username <span className="text-danger">*</span></FormLabel>
              <FormControl size="sm" placeholder="jsmith"
                value={form.username}
                onChange={e => setForm({ ...form, username: e.target.value })} />
            </Col>
            <Col md={6}>
              <FormLabel style={{ fontSize: 12 }}>Email <span className="text-danger">*</span></FormLabel>
              <FormControl size="sm" type="email" placeholder="john@example.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })} />
            </Col>
            <Col md={6}>
              <FormLabel style={{ fontSize: 12 }}>Password <span className="text-danger">*</span></FormLabel>
              <FormControl size="sm" type="password" placeholder="••••••••"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })} />
            </Col>
            <Col md={6}>
              <FormLabel style={{ fontSize: 12 }}>Phone Number</FormLabel>
              <FormControl size="sm" placeholder="+27 82 000 0000"
                value={form.phoneNumber}
                onChange={e => setForm({ ...form, phoneNumber: e.target.value })} />
            </Col>
            <Col md={6}>
              <FormLabel style={{ fontSize: 12 }}>Plant ID</FormLabel>
              <FormControl size="sm" placeholder="e.g. 1-HQ"
                value={form.plantId}
                onChange={e => setForm({ ...form, plantId: e.target.value })} />
            </Col>
            <Col md={12} className="d-flex gap-4 mt-1">
              <FormGroup>
                <FormCheck type="switch" label="Super Admin"
                  checked={form.isSuperAdmin}
                  onChange={e => setForm({ ...form, isSuperAdmin: e.target.checked })} />
              </FormGroup>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button size="sm" variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button size="sm" style={{ background: NAVY, border: 'none' }}
            disabled={saving} onClick={handleSave}>
            {saving ? 'Saving...' : 'Add User'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered size="sm">
        <Modal.Header closeButton style={{ background: NAVY, color: '#fff' }}>
          <Modal.Title style={{ fontSize: 15 }}>Delete User</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete <strong>{selectedUser?.username}</strong>?
        </Modal.Body>
        <Modal.Footer>
          <Button size="sm" variant="secondary" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
          <Button size="sm" variant="danger" disabled={saving} onClick={handleDelete}>
            {saving ? 'Deleting...' : 'Delete'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  )
}
