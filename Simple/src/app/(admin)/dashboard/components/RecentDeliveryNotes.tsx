'use client';

import { useState, useMemo } from 'react';
import { Badge } from 'react-bootstrap';
import Link from 'next/link';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type PaginationState,
} from '@tanstack/react-table';
import { Truck, ChevronLeft, ChevronRight, ArrowUp, ArrowDown, ArrowUpDown, Search, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { RecentDeliveryNote } from '@/services/dashboardStatsService';

const fmt = (d: string) =>
  new Date(d).toLocaleDateString('en-ZA', { day: '2-digit', month: 'short', year: 'numeric' });

const getStatusVariant = (s: string | null) => {
  switch (s?.toUpperCase()) {
    case 'COMPLETED':  return 'success'
    case 'AVAILABLE':  return 'info'
    case 'SIGNED':     return 'primary'
    case 'PENDING':    return 'warning'
    case 'CANCELLED':  return 'danger'
    default:           return 'secondary'
  }
}

const SortBtn = ({ column, label }: { column: any; label: string }) => (
  <button className="dash-sort-btn" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
    {label}
    {column.getIsSorted() === 'asc'  ? <ArrowUp size={12} /> :
     column.getIsSorted() === 'desc' ? <ArrowDown size={12} /> :
     <ArrowUpDown size={12} className="dash-sort-icon-neutral" />}
  </button>
);

const RecentDeliveryNotes = ({ notes, total }: { notes: RecentDeliveryNote[]; total: number }) => {
  const [sorting, setSorting]       = useState<SortingState>([]);
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });

  const [deliveryNo,   setDeliveryNo]   = useState('');
  const [customerName, setCustomerName] = useState('');
  const [invoiceNo,    setInvoiceNo]    = useState('');
  const [shipmentNo,   setShipmentNo]   = useState('');
  const [status,       setStatus]       = useState('');
  const [dateLoaded,   setDateLoaded]   = useState('');

  const [activeFilter, setActiveFilter] = useState({
    deliveryNo: '', customerName: '', invoiceNo: '', shipmentNo: '', status: '', dateLoaded: '',
  });

  const handleSearch = () => {
    setActiveFilter({ deliveryNo, customerName, invoiceNo, shipmentNo, status, dateLoaded });
    table.setPageIndex(0);
  };

  const handleReset = () => {
    setDeliveryNo(''); setCustomerName(''); setInvoiceNo(''); setShipmentNo(''); setStatus(''); setDateLoaded('');
    setActiveFilter({ deliveryNo: '', customerName: '', invoiceNo: '', shipmentNo: '', status: '', dateLoaded: '' });
    table.setPageIndex(0);
  };

  const columns = useMemo<ColumnDef<RecentDeliveryNote>[]>(() => [
    {
      accessorKey: 'deliveryNo',
      header: ({ column }) => <SortBtn column={column} label="Delivery No" />,
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="dash-icon-circle dash-icon-circle-blue w-9 h-9">
            <Truck size={16} className="dash-text-blue" />
          </div>
          <Link href="/delivery-notes" className="dash-dn-link">
            {row.original.deliveryNo}
          </Link>
        </div>
      ),
    },
    {
      accessorKey: 'customerName',
      header: ({ column }) => <SortBtn column={column} label="Customer" />,
      cell: ({ getValue }) => <span className="dash-cell-muted">{(getValue() as string) ?? '-'}</span>,
    },
    {
      accessorKey: 'invoiceNo',
      header: ({ column }) => <SortBtn column={column} label="Invoice No" />,
      cell: ({ getValue }) => <span className="dash-cell-amber">{(getValue() as string) ?? '-'}</span>,
    },
    {
      accessorKey: 'shipmentNo',
      header: ({ column }) => <SortBtn column={column} label="Shipment No" />,
      cell: ({ getValue }) => <span className="dash-cell-muted">{(getValue() as string) ?? '-'}</span>,
    },
    {
      accessorKey: 'purchaseOrderNo',
      header: ({ column }) => <SortBtn column={column} label="PO No" />,
      cell: ({ getValue }) => <span className="dash-cell-muted">{(getValue() as string) ?? '-'}</span>,
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => <SortBtn column={column} label="Date" />,
      cell: ({ getValue }) => <span className="dash-cell-muted">{fmt(getValue() as string)}</span>,
    },
    {
      accessorKey: 'status',
      header: () => <span className="dash-sort-btn" style={{ cursor: 'default' }}>Status</span>,
      cell: ({ getValue }) => {
        const s = getValue() as string | null;
        return (
          <Badge bg={getStatusVariant(s)}>{s ?? '—'}</Badge>
        );
      },
    },
  ], []);

  const filtered = useMemo(() => {
    return notes.filter(n => {
      const { deliveryNo: dn, customerName: cn, invoiceNo: inv, shipmentNo: shp, status: st, dateLoaded: dl } = activeFilter;
      if (dn  && !n.deliveryNo?.toLowerCase().includes(dn.toLowerCase()))   return false;
      if (cn  && !n.customerName?.toLowerCase().includes(cn.toLowerCase())) return false;
      if (inv && !n.invoiceNo?.toLowerCase().includes(inv.toLowerCase()))   return false;
      if (shp && !n.shipmentNo?.toLowerCase().includes(shp.toLowerCase()))  return false;
      if (st  && n.status?.toUpperCase() !== st)                            return false;
      if (dl  && n.createdAt.split('T')[0] !== dl)                          return false;
      return true;
    });
  }, [notes, activeFilter]);

  const table = useReactTable({
    data:                  filtered,
    columns,
    state:                 { sorting, pagination },
    onSortingChange:       setSorting,
    onPaginationChange:    setPagination,
    getCoreRowModel:       getCoreRowModel(),
    getSortedRowModel:     getSortedRowModel(),
    getFilteredRowModel:   getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination:      false,
  });

  const { pageIndex, pageSize } = pagination;
  const filteredCount = table.getFilteredRowModel().rows.length;
  const from = filteredCount === 0 ? 0 : pageIndex * pageSize + 1;
  const to   = Math.min((pageIndex + 1) * pageSize, filteredCount);

  return (
    <div>
      {/* Filters */}
      <div className="dash-filter-bar">
        <input value={deliveryNo}   onChange={e => setDeliveryNo(e.target.value)}   onKeyDown={e => e.key === 'Enter' && handleSearch()} placeholder="Delivery No"   className="dash-filter-input" />
        <input value={customerName} onChange={e => setCustomerName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} placeholder="Customer Name" className="dash-filter-input" />
        <input value={invoiceNo}    onChange={e => setInvoiceNo(e.target.value)}    onKeyDown={e => e.key === 'Enter' && handleSearch()} placeholder="Invoice No"    className="dash-filter-input" />
        <input value={shipmentNo}   onChange={e => setShipmentNo(e.target.value)}   onKeyDown={e => e.key === 'Enter' && handleSearch()} placeholder="Shipment No"   className="dash-filter-input" />
        <select value={status} onChange={e => setStatus(e.target.value)} className="dash-filter-input">
          <option value="">All Statuses</option>
          <option value="AVAILABLE">Available</option>
          <option value="PENDING">Pending</option>
          <option value="SIGNED">Signed</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
        <input type="date" value={dateLoaded} onChange={e => setDateLoaded(e.target.value)} className="dash-filter-input" style={{ flex: '0 0 auto', width: 160 }} title="Date" />
        <Button size="sm" onClick={handleSearch} className="flex items-center gap-1.5 whitespace-nowrap btn-blue rounded-md">
          <Search size={13} /> Search
        </Button>
        <Button size="sm" variant="outline" onClick={handleReset} className="flex items-center gap-1.5 whitespace-nowrap rounded-md">
          <RotateCcw size={13} /> Reset
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            {table.getHeaderGroups().map(hg => (
              <tr key={hg.id} className="dash-table-header">
                {hg.headers.map(header => (
                  <th key={header.id}>
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-10 dash-cell-muted">
                  No delivery notes found
                </td>
              </tr>
            ) : table.getRowModel().rows.map(row => (
              <tr key={row.id} className="dash-table-row">
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="dash-pagination">
        <span className="dash-cell-muted text-sm">
          Showing <span className="font-semibold dash-text-navy">{from}</span> to{' '}
          <span className="font-semibold dash-text-navy">{to}</span> of{' '}
          <span className="font-semibold dash-text-navy">{total}</span> Delivery Notes
        </span>

        <div className="flex items-center gap-1">
          <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} className="dash-nav-btn">
            <ChevronLeft size={16} />
          </button>

          {Array.from({ length: table.getPageCount() }, (_, i) => (
            <button
              key={i}
              onClick={() => table.setPageIndex(i)}
              className={`dash-page-btn ${pageIndex === i ? 'dash-page-btn-active' : ''}`}
            >
              {i + 1}
            </button>
          ))}

          <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} className="dash-nav-btn">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecentDeliveryNotes;
