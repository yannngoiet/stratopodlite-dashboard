'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table'
import { Container, Badge } from 'react-bootstrap'
import { ArrowUp, ArrowDown, ArrowUpDown, Search, RotateCcw } from 'lucide-react'
import { LuDownload } from 'react-icons/lu'
import { Button } from '@/components/ui/button'
import * as XLSX from 'xlsx'
import customerService, { type Customer } from '@/services/customerService'

const formatDate = (val: string) =>
  new Date(val).toLocaleString('en-ZA', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })

const formatAddress = (a1: string | null, a2: string | null, a3: string | null) => {
  const parts = [a1, a2, a3].filter(Boolean)
  return parts.length > 0 ? parts.join(', ') : '—'
}

const SortHeader = ({ column, label }: { column: any; label: string }) => (
  <button
    className="dash-sort-btn-dark"
    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
  >
    {label}
    {column.getIsSorted() === 'asc'  ? <ArrowUp size={12} /> :
     column.getIsSorted() === 'desc' ? <ArrowDown size={12} /> :
     <ArrowUpDown size={12} className="dash-sort-icon-neutral" />}
  </button>
)

export default function CustomersPage() {
  const [data, setData]             = useState<Customer[]>([])
  const [loading, setLoading]       = useState(false)
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [page, setPage]             = useState(1)
  const [sorting, setSorting]       = useState<SortingState>([])
  const pageSize                    = 10

  const [customerCode, setCustomerCode] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [email,        setEmail]        = useState('')
  const [telephone,    setTelephone]    = useState('')
  const [isActive,     setIsActive]     = useState('')
  const [createdDate,  setCreatedDate]  = useState('')

  const fetchData = useCallback(async (
    currentPage: number,
    code: string,
    name: string,
    mail: string,
    phone: string,
    active: string,
    date: string
  ) => {
    setLoading(true)
    try {
      const result = await customerService.getAll({
        customerCode: code   || undefined,
        customerName: name   || undefined,
        email:        mail   || undefined,
        telephone:    phone  || undefined,
        isActive:     active === '' ? undefined : active === 'true',
        createdDate:  date   || undefined,
        page:         currentPage,
        pageSize,
      })
      setData(result.items)
      setTotalCount(result.totalCount)
      setTotalPages(result.totalPages || 1)
    } catch (err) {
      console.error(err)
      setData([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData(1, '', '', '', '', '', '') }, [fetchData])

  const handleSearch = () => {
    setPage(1)
    fetchData(1, customerCode, customerName, email, telephone, isActive, createdDate)
  }

  const handleReset = () => {
    setCustomerCode(''); setCustomerName(''); setEmail(''); setTelephone(''); setIsActive(''); setCreatedDate('')
    setPage(1)
    fetchData(1, '', '', '', '', '', '')
  }

  const handlePageChange = (p: number) => {
    setPage(p)
    fetchData(p, customerCode, customerName, email, telephone, isActive, createdDate)
  }

  const filteredData = useMemo(() => {
    if (!createdDate) return data
    return data.filter(c => c.createdAt.split('T')[0] === createdDate)
  }, [data, createdDate])

  const handleExportExcel = () => {
    const rows = data.map((item, i) => ({
      '#':               i + 1,
      'Account No':      item.customerCode,
      'Customer Name':   item.customerName,
      'Email':           item.contact          ?? '—',
      'Telephone':       item.telephone        ?? '—',
      'Bill-To Address': formatAddress(item.billToAddr1, item.billToAddr2, item.billToAddr3),
      'Ship-To Address': formatAddress(item.shipToAddr1, item.shipToAddr2, item.shipToAddr3),
      'Status':          item.isActive ? 'Active' : 'Inactive',
      'Created':         formatDate(item.createdAt),
    }))
    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Customers')
    XLSX.writeFile(wb, `Customers_${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  const columns: ColumnDef<Customer>[] = [
    {
      header: '#',
      size: 50,
      cell: ({ row }) => (page - 1) * pageSize + row.index + 1,
    },
    {
      accessorKey: 'customerCode',
      header: ({ column }) => <SortHeader column={column} label="Account No" />,
      cell: ({ row }) => <span className="dash-text-navy">{row.original.customerCode}</span>,
    },
    {
      accessorKey: 'customerName',
      header: ({ column }) => <SortHeader column={column} label="Customer Name" />,
    },
    {
      accessorKey: 'contact',
      header: ({ column }) => <SortHeader column={column} label="Email" />,
      cell: ({ row }) => <span className="dash-cell-muted">{row.original.contact ?? '—'}</span>,
    },
    {
      accessorKey: 'telephone',
      header: ({ column }) => <SortHeader column={column} label="Telephone" />,
      cell: ({ row }) => <span className="dash-cell-muted">{row.original.telephone ?? '—'}</span>,
    },
    {
      id: 'billAddress',
      header: ({ column }) => <SortHeader column={column} label="Bill-To Address" />,
      cell: ({ row }) => (
        <span className="dash-cell-muted">
          {formatAddress(row.original.billToAddr1, row.original.billToAddr2, row.original.billToAddr3)}
        </span>
      ),
    },
    {
      id: 'shipAddress',
      header: ({ column }) => <SortHeader column={column} label="Ship-To Address" />,
      cell: ({ row }) => (
        <span className="dash-cell-muted">
          {formatAddress(row.original.shipToAddr1, row.original.shipToAddr2, row.original.shipToAddr3)}
        </span>
      ),
    },
    {
      accessorKey: 'isActive',
      header: ({ column }) => <SortHeader column={column} label="Status" />,
      cell: ({ row }) => (
        <Badge bg={row.original.isActive ? 'success' : 'danger'}>
          {row.original.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => <SortHeader column={column} label="Created" />,
      cell: ({ row }) => <span className="dash-cell-muted">{formatDate(row.original.createdAt)}</span>,
    },
  ]

  const table = useReactTable({
    data: filteredData,
    columns,
    state:             { sorting },
    onSortingChange:   setSorting,
    getCoreRowModel:   getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination:  true,
    pageCount:         totalPages,
  })

  const start = totalCount === 0 ? 0 : (page - 1) * pageSize + 1
  const end   = Math.min(page * pageSize, totalCount)

  return (
    <Container fluid className="py-3">
      <div className="card shadow-sm">
        <div className="card-header d-flex justify-content-between align-items-center py-2">
          <h6 className="mb-0 fw-semibold">
            Customers ({totalCount} total)
          </h6>
        </div>

        <div className="card-body p-3">
          {/* Filters */}
          <div className="dash-filter-bar mb-3">
            <input value={customerCode} onChange={e => setCustomerCode(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} placeholder="Account No"    className="dash-filter-input" />
            <input value={customerName} onChange={e => setCustomerName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} placeholder="Customer Name" className="dash-filter-input" />
            <input value={email}        onChange={e => setEmail(e.target.value)}        onKeyDown={e => e.key === 'Enter' && handleSearch()} placeholder="Email"         className="dash-filter-input" />
            <input value={telephone}    onChange={e => setTelephone(e.target.value)}    onKeyDown={e => e.key === 'Enter' && handleSearch()} placeholder="Telephone"     className="dash-filter-input" />
            <select value={isActive} onChange={e => setIsActive(e.target.value)} className="dash-filter-input">
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
            <input type="date" value={createdDate} onChange={e => setCreatedDate(e.target.value)} className="dash-filter-input" style={{ flex: '0 0 auto', width: 160 }} title="Created Date" />
            <Button size="sm" onClick={handleSearch} disabled={loading} className="flex items-center gap-1.5 whitespace-nowrap btn-blue rounded-md">
              <Search size={13} /> Search
            </Button>
            <Button size="sm" variant="outline" onClick={handleReset} disabled={loading} className="flex items-center gap-1.5 whitespace-nowrap rounded-md">
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
                      No customers found
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
              {totalCount > 0 ? `Showing ${start} to ${end} of ${totalCount} entries` : 'No entries found'}
            </small>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" disabled={page === 1 || loading} onClick={() => handlePageChange(1)} className="rounded-md px-2">«</Button>
              <Button variant="outline" size="sm" disabled={page === 1 || loading} onClick={() => handlePageChange(page - 1)} className="rounded-md px-2">‹</Button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = Math.max(1, page - 2) + i
                if (pageNum > totalPages) return null
                return (
                  <Button key={pageNum} size="sm"
                    className={`rounded-md px-2 ${pageNum === page ? 'btn-navy' : ''}`}
                    variant={pageNum === page ? 'default' : 'outline'}
                    onClick={() => handlePageChange(pageNum)}>
                    {pageNum}
                  </Button>
                )
              })}
              <Button variant="outline" size="sm" disabled={page >= totalPages || loading} onClick={() => handlePageChange(page + 1)} className="rounded-md px-2">›</Button>
              <Button variant="outline" size="sm" disabled={page >= totalPages || loading} onClick={() => handlePageChange(totalPages)} className="rounded-md px-2">»</Button>
            </div>
          </div>

          {/* Export */}
          <div className="flex justify-center mt-3 gap-2">
            <Button size="sm" onClick={handleExportExcel} disabled={data.length === 0} className="flex items-center gap-1.5 btn-green rounded-md">
              <LuDownload size={13} /> Export to Excel
            </Button>
          </div>
        </div>
      </div>
    </Container>
  )
}
