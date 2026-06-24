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
import shipmentService, { type Shipment } from '@/services/shipmentService'

const getStatusVariant = (s: string | null) => {
  switch (s) {
    case 'Completed':   return 'success'
    case 'In Progress': return 'primary'
    case 'Assigned':    return 'info'
    case 'Pending':     return 'warning'
    case 'Cancelled':   return 'danger'
    default:            return 'secondary'
  }
}

const formatDate = (val: string | null) =>
  val ? new Date(val).toLocaleString('en-ZA', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }) : '—'

const formatDateOnly = (val: string | null) =>
  val ? new Date(val).toLocaleDateString('en-ZA') : '—'

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

export default function ShipmentReportPage() {
  const [data, setData]               = useState<Shipment[]>([])
  const [loading, setLoading]         = useState(false)
  const [totalCount, setTotalCount]   = useState(0)
  const [totalPages, setTotalPages]   = useState(1)
  const [page, setPage]               = useState(1)
  const [sorting, setSorting]         = useState<SortingState>([])
  const pageSize = 10

  const [shipmentNo, setShipmentNo] = useState('')
  const [plantId,    setPlantId]    = useState('')
  const [driverName, setDriverName] = useState('')
  const [vehicleReg, setVehicleReg] = useState('')
  const [statusId,   setStatusId]   = useState('')
  const [dateLoaded, setDateLoaded] = useState('')

  const fetchData = useCallback(async (
    currentPage = 1,
    sNo = '', plant = '', sId = ''
  ) => {
    setLoading(true)
    try {
      const result = await shipmentService.getAll({
        shipmentNo: sNo   || undefined,
        plantId:    plant || undefined,
        statusId:   sId   ? Number(sId) : undefined,
        page:       currentPage,
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

  useEffect(() => { fetchData() }, [fetchData])

  const handleSearch = () => {
    setPage(1)
    fetchData(1, shipmentNo, plantId, statusId)
  }

  const handleReset = () => {
    setShipmentNo(''); setPlantId(''); setDriverName(''); setVehicleReg(''); setStatusId(''); setDateLoaded('')
    setPage(1)
    fetchData(1, '', '', '')
  }

  const handlePageChange = (p: number) => {
    setPage(p)
    fetchData(p, shipmentNo, plantId, statusId)
  }

  const filteredData = useMemo(() => {
    if (!dateLoaded) return data
    return data.filter(s => s.createdAt.split('T')[0] === dateLoaded)
  }, [data, dateLoaded])

  const handleExportExcel = () => {
    const rows = data.map((item, i) => ({
      '#':            i + 1,
      'Shipment No':  item.shipmentNo,
      'Plant':        item.plantId        ?? '—',
      'Driver':       item.driverName     ?? '—',
      'Vehicle':      item.vehicleReg     ?? '—',
      'Status':       item.status         ?? '—',
      'Exec. Date':   formatDateOnly(item.assignedExecutionDate),
      'Deliveries':   item.deliveryNotesCount,
      'Created':      formatDate(item.createdAt),
    }))
    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Shipments')
    XLSX.writeFile(wb, `Shipments_${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  const columns: ColumnDef<Shipment>[] = [
    {
      header: '#',
      size: 50,
      cell: ({ row }) => (page - 1) * pageSize + row.index + 1,
    },
    {
      accessorKey: 'shipmentNo',
      header: ({ column }) => <SortHeader column={column} label="Shipment No" />,
    },
    {
      accessorKey: 'plantId',
      header: ({ column }) => <SortHeader column={column} label="Plant" />,
      cell: ({ row }) => row.original.plantId ?? '—',
    },
    {
      accessorKey: 'driverName',
      header: ({ column }) => <SortHeader column={column} label="Driver" />,
      cell: ({ row }) => row.original.driverName ?? '—',
    },
    {
      accessorKey: 'vehicleReg',
      header: ({ column }) => <SortHeader column={column} label="Vehicle" />,
      cell: ({ row }) => row.original.vehicleReg ?? '—',
    },
    {
      accessorKey: 'deliveryNotesCount',
      header: ({ column }) => <SortHeader column={column} label="Deliveries" />,
      cell: ({ row }) => (
        <Badge bg="info">{row.original.deliveryNotesCount}</Badge>
      ),
    },
    {
      accessorKey: 'status',
      header: ({ column }) => <SortHeader column={column} label="Status" />,
      cell: ({ row }) => {
        const s = row.original.status
        if (!s) return <span className="dash-cell-muted">—</span>
        return <Badge bg={getStatusVariant(s)}>{s}</Badge>
      },
    },
    {
      accessorKey: 'assignedExecutionDate',
      header: ({ column }) => <SortHeader column={column} label="Exec. Date" />,
      cell: ({ row }) => formatDateOnly(row.original.assignedExecutionDate),
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
            Shipments ({totalCount} total)
          </h6>
        </div>

        <div className="card-body p-3">
          {/* Filters */}
          <div className="dash-filter-bar mb-3">
            <input value={shipmentNo} onChange={e => setShipmentNo(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} placeholder="Shipment No"  className="dash-filter-input" />
            <input value={plantId}    onChange={e => setPlantId(e.target.value)}    onKeyDown={e => e.key === 'Enter' && handleSearch()} placeholder="Plant"         className="dash-filter-input" />
            <input value={driverName} onChange={e => setDriverName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} placeholder="Driver Name"  className="dash-filter-input" />
            <input value={vehicleReg} onChange={e => setVehicleReg(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} placeholder="Vehicle Reg"  className="dash-filter-input" />
            <select value={statusId} onChange={e => setStatusId(e.target.value)} className="dash-filter-input">
              <option value="">All Statuses</option>
              <option value="1">Pending</option>
              <option value="2">Assigned</option>
              <option value="3">In Progress</option>
              <option value="4">Completed</option>
              <option value="5">Cancelled</option>
            </select>
            <input type="date" value={dateLoaded} onChange={e => setDateLoaded(e.target.value)} className="dash-filter-input" style={{ flex: '0 0 auto', width: 160 }} title="Exec. Date" />
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
                      No shipments found
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
            <Button size="sm" className="flex items-center gap-1.5 btn-green rounded-md" onClick={handleExportExcel} disabled={data.length === 0}>
              <LuDownload size={13} /> Export to Excel
            </Button>
          </div>
        </div>
      </div>
    </Container>
  )
}
