'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table';
import { Container, Badge, Spinner, Modal } from 'react-bootstrap';
import { LuDownload, LuEye, LuX } from 'react-icons/lu';
import { ArrowUp, ArrowDown, ArrowUpDown, Search, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import * as XLSX from 'xlsx';
import deliveryNoteService, { type DeliveryNoteListItem } from '@/services/deliveryNoteService';
import { notify } from '@/lib/toast';


const getStatusVariant = (status: string | null) => {
  switch (status) {
    case 'Pending':              return 'warning'
    case 'InProgress':           return 'primary'
    case 'Arrived':              return 'info'
    case 'Offloading':           return 'info'
    case 'OffloadingComplete':   return 'info'
    case 'Departed':             return 'primary'
    case 'Completed':            return 'success'
    case 'BackAtDepot':          return 'success'
    case 'EndOfDay':             return 'secondary'
    case 'Cancelled':            return 'danger'
    default:                     return 'secondary'
  }
}

const formatDate = (date: string | null) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('en-ZA', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

const Page = () => {

  const [data, setData]             = useState<DeliveryNoteListItem[]>([])
  const [loading, setLoading]       = useState(false)
  const [totalCount, setTotalCount] = useState(0)
  const [page, setPage]             = useState(1)
  const [pageSize]                  = useState(10)
  const [totalPages, setTotalPages] = useState(0)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const [previewingId,  setPreviewingId]  = useState<string | null>(null)
  const [previewUrl,    setPreviewUrl]    = useState<string | null>(null)
  const [previewDn,     setPreviewDn]     = useState<string | null>(null)
  const [sorting, setSorting]             = useState<SortingState>([])

  const [deliveryNo,   setDeliveryNo]   = useState('')
  const [shipmentNo,   setShipmentNo]   = useState('')
  const [customerName, setCustomerName] = useState('')
  const [invoiceNo,    setInvoiceNo]    = useState('')
  const [status,       setStatus]       = useState('')
  const [dateLoaded,   setDateLoaded]   = useState('')

  // ── Read error message from blob response ─────────────────────────────────
  const readBlobError = async (err: any): Promise<string | undefined> => {
    try {
      const blob: Blob = err?.response?.data
      if (!blob) return undefined
      const text = await blob.text()
      const json = JSON.parse(text)
      return json?.message ?? undefined
    } catch {
      return undefined
    }
  }

  // ── Download PDF ───────────────────────────────────────────────────────────
  const handleDownloadPdf = async (dn: string) => {
    setDownloadingId(dn)
    try {
      const blob = await deliveryNoteService.downloadPdf(dn)
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = url
      a.download = `DeliveryNote_${dn}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err: any) {
      const status = err?.response?.status
      if (status === 404) {
        notify.warning(
          'No template configured',
          'Please upload a PDF template in Configuration → Templates before downloading.',
          { duration: Infinity }
        )
      } else {
        const apiMsg = await readBlobError(err)
        notify.error(
          'Download failed',
          apiMsg ?? 'An error occurred while generating the PDF.',
          { duration: Infinity }
        )
      }
    } finally {
      setDownloadingId(null)
    }
  }

  // ── Preview PDF ────────────────────────────────────────────────────────────
  const handlePreview = async (dn: string) => {
    setPreviewingId(dn)
    try {
      const blob = await deliveryNoteService.downloadPdf(dn)
      const url  = URL.createObjectURL(blob)
      setPreviewUrl(url)
      setPreviewDn(dn)
    } catch (err: any) {
      const status = err?.response?.status
      if (status === 404) {
        notify.warning(
          'No template configured',
          'Please upload a PDF template in Configuration → Templates before previewing.',
          { duration: Infinity }
        )
      } else {
        const apiMsg = await readBlobError(err)
        notify.error(
          'Preview failed',
          apiMsg ?? 'An error occurred while loading the PDF preview.',
          { duration: Infinity }
        )
      }
    } finally {
      setPreviewingId(null)
    }
  }

  const closePreview = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)
    setPreviewDn(null)
  }

  // ── Columns ────────────────────────────────────────────────────────────────
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

  const columns: ColumnDef<DeliveryNoteListItem>[] = [
    {
      header: '#',
      cell: ({ row }) => row.index + 1,
      size: 50
    },
    {
      accessorKey: 'deliveryNo',
      header: ({ column }) => <SortHeader column={column} label="Delivery Nr" />,
    },
    {
      accessorKey: 'shipmentNo',
      header: ({ column }) => <SortHeader column={column} label="Shipment Nr" />,
      cell: ({ row }) => row.original.shipmentNo ?? '-'
    },
    {
      accessorKey: 'customerName',
      header: ({ column }) => <SortHeader column={column} label="Customer Name" />,
      cell: ({ row }) => row.original.customerName ?? '-'
    },
    {
      accessorKey: 'invoiceNo',
      header: ({ column }) => <SortHeader column={column} label="Invoice Nr" />,
      cell: ({ row }) => row.original.invoiceNo ?? '-'
    },
    {
      accessorKey: 'purchaseOrderNo',
      header: 'Order Nr',
      cell: ({ row }) => row.original.purchaseOrderNo ?? '-'
    },
    {
      accessorKey: 'status',
      header: ({ column }) => <SortHeader column={column} label="Status" />,
      cell: ({ row }) => (
        <Badge bg={getStatusVariant(row.original.status)}>
          {row.original.status ?? '-'}
        </Badge>
      )
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => <SortHeader column={column} label="Date Loaded" />,
      cell: ({ row }) => formatDate(row.original.createdAt)
    },
    {
      accessorKey: 'updatedAt',
      header: ({ column }) => <SortHeader column={column} label="Last Updated" />,
      cell: ({ row }) => formatDate(row.original.updatedAt)
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const dn = row.original.deliveryNo
        const isDownloading = downloadingId === dn
        const isPreviewing  = previewingId  === dn

        if (row.original.status !== 'Completed') return null

        return (
          <div className="flex gap-1">
            <Button size="sm" variant="outline" title="Preview PDF" disabled={isPreviewing} onClick={() => handlePreview(dn)} className="rounded-md px-2">
              {isPreviewing ? <Spinner size="sm" /> : <LuEye size={14} />}
            </Button>
            <Button size="sm" variant="outline" title="Download PDF" disabled={isDownloading} onClick={() => handleDownloadPdf(dn)} className="rounded-md px-2 !border-green-500 !text-green-600 hover:!bg-green-50">
              {isDownloading ? <Spinner size="sm" /> : <LuDownload size={14} />}
            </Button>
          </div>
        )
      }
    }
  ]

  // ── Fetch data ─────────────────────────────────────────────────────────────
  const fetchData = useCallback(async (
    currentPage       = 1,
    currentDeliveryNo = '',
    currentShipmentNo = '',
    currentCustomer   = '',
    currentInvoiceNo  = '',
    currentStatus     = '',
    currentDateLoaded = ''
  ) => {
    setLoading(true)
    try {
      const result = await deliveryNoteService.getAll({
        page:         currentPage,
        pageSize,
        deliveryNo:   currentDeliveryNo  || undefined,
        shipmentNo:   currentShipmentNo  || undefined,
        customerName: currentCustomer    || undefined,
        invoiceNo:    currentInvoiceNo   || undefined,
        status:       currentStatus      || undefined,
        dateFrom:     currentDateLoaded  || undefined,
        dateTo:       currentDateLoaded  || undefined,
      })
      setData(result.items)
      setTotalCount(result.totalCount)
      setTotalPages(result.totalPages)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [pageSize])

  useEffect(() => { fetchData() }, [fetchData])

  const handleSearch = () => {
    setPage(1)
    fetchData(1, deliveryNo, shipmentNo, customerName, invoiceNo, status, dateLoaded)
  }

  const handleReset = () => {
    setDeliveryNo(''); setShipmentNo(''); setCustomerName(''); setInvoiceNo(''); setStatus(''); setDateLoaded('')
    setPage(1)
    fetchData(1, '', '', '', '', '', '')
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    fetchData(newPage, deliveryNo, shipmentNo, customerName, invoiceNo, status, dateLoaded)
  }

  const handleExportExcel = () => {
    const rows = data.map((item, i) => ({
      '#':             i + 1,
      'Delivery No':   item.deliveryNo,
      'Shipment No':   item.shipmentNo    ?? '-',
      'Customer Name': item.customerName  ?? '-',
      'Invoice No':    item.invoiceNo     ?? '-',
      'Order No':      item.purchaseOrderNo ?? '-',
      'Status':        item.status        ?? '-',
      'Date Loaded':   formatDate(item.createdAt),
      'Last Updated':  formatDate(item.updatedAt),
    }))
    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Delivery Notes')
    XLSX.writeFile(wb, `DeliveryNotes_${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  const table = useReactTable({
    data: data ?? [],
    columns,
    state:            { sorting },
    onSortingChange:  setSorting,
    getCoreRowModel:  getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    pageCount:        totalPages,
  })

  const start = totalCount === 0 ? 0 : (page - 1) * pageSize + 1
  const end   = Math.min(page * pageSize, totalCount)

  return (
    <>
    <Container fluid className="py-3">
      <div className="card shadow-sm">
        <div className="card-header d-flex justify-content-between align-items-center py-2">
          <h6 className="mb-0 fw-semibold">
            Delivery Notes ({totalCount} total)
          </h6>
        </div>

        <div className="card-body p-3">
          {/* Filters */}
          <div className="dash-filter-bar mb-3">
            <input value={deliveryNo}   onChange={e => setDeliveryNo(e.target.value)}   onKeyDown={e => e.key === 'Enter' && handleSearch()} placeholder="Delivery No"   className="dash-filter-input" />
            <input value={shipmentNo}   onChange={e => setShipmentNo(e.target.value)}   onKeyDown={e => e.key === 'Enter' && handleSearch()} placeholder="Shipment No"   className="dash-filter-input" />
            <input value={customerName} onChange={e => setCustomerName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} placeholder="Customer Name" className="dash-filter-input" />
            <input value={invoiceNo}    onChange={e => setInvoiceNo(e.target.value)}    onKeyDown={e => e.key === 'Enter' && handleSearch()} placeholder="Invoice No"    className="dash-filter-input" />
            <select value={status} onChange={e => setStatus(e.target.value)} className="dash-filter-input">
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="InProgress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            <input type="date" value={dateLoaded} onChange={e => setDateLoaded(e.target.value)} className="dash-filter-input" style={{ flex: '0 0 auto', width: 160 }} title="Date Loaded" />
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
                {table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                      <th key={header.id} className="py-2 px-3 text-uppercase">
                        {flexRender(header.column.columnDef.header, header.getContext())}
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
                      No delivery notes found
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
            <Button size="sm" className="flex items-center gap-1.5 btn-sky rounded-md">
              <LuDownload size={13} /> Download Report
            </Button>
            <Button size="sm" onClick={handleExportExcel} disabled={data.length === 0} className="flex items-center gap-1.5 btn-green rounded-md">
              <LuDownload size={13} /> Export to Excel
            </Button>
          </div>
        </div>
      </div>
    </Container>

      {/* ── PDF Preview Modal ──────────────────────────────────────────────── */}
      <Modal show={!!previewUrl} onHide={closePreview} size="xl" centered
        dialogClassName="modal-fullheight">
        <Modal.Header style={{ background: '#1a2340', padding: '10px 16px' }}>
          <Modal.Title style={{ color: '#fff', fontSize: 14, fontWeight: 600 }}>
            Preview — {previewDn}
          </Modal.Title>
          <button onClick={closePreview}
            style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', opacity: 0.7, marginLeft: 'auto' }}>
            <LuX size={18} />
          </button>
        </Modal.Header>
        <Modal.Body style={{ padding: 0, height: '80vh' }}>
          {previewUrl && (
            <iframe
              src={`${previewUrl}#navpanes=0&scrollbar=1`}
              style={{ width: '100%', height: '100%', border: 'none' }}
              title={`Preview ${previewDn}`}
            />
          )}
        </Modal.Body>
      </Modal>
    </>
  )
}

export default Page