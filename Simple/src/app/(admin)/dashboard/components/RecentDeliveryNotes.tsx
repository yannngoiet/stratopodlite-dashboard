'use client';

import { useState, useMemo } from 'react';
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
} from '@tanstack/react-table';
import { FileText, Truck, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ArrowUpDown, ArrowUp, ArrowDown, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { RecentDeliveryNote } from '@/services/dashboardStatsService';

const fmt = (d: string) =>
  new Date(d).toLocaleDateString('en-ZA', { day: '2-digit', month: 'short', year: 'numeric' });

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  AVAILABLE:  { bg: '#edfaf3', color: '#1a7a4a' },
  SIGNED:     { bg: '#f0f5ff', color: '#3b6fd4' },
  COMPLETED:  { bg: '#edfaf3', color: '#1a7a4a' },
  PENDING:    { bg: '#fff8e1', color: '#7a5800' },
  CANCELLED:  { bg: '#fef2f2', color: '#991b1b' },
};

const getStatusStyle = (s: string | null) =>
  STATUS_STYLES[s?.toUpperCase() ?? ''] ?? { bg: '#f0f2f5', color: '#6b7a99' };

const RecentDeliveryNotes = ({ notes, total }: { notes: RecentDeliveryNote[]; total: number }) => {
  const [sorting, setSorting]         = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [pageSize, setPageSize]       = useState(10);

  const columns = useMemo<ColumnDef<RecentDeliveryNote>[]>(() => [
    {
      accessorKey: 'deliveryNo',
      header: ({ column }) => (
        <button
          className="flex items-center gap-1 text-[10px] font-semibold text-[#6b7a99] uppercase tracking-wider hover:text-[#1a2340] transition-colors"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Delivery No
          {column.getIsSorted() === 'asc'  ? <ArrowUp size={11} /> :
           column.getIsSorted() === 'desc' ? <ArrowDown size={11} /> :
           <ArrowUpDown size={11} />}
        </button>
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: '#f0f5ff' }}
          >
            <Truck size={13} style={{ color: '#3b6fd4' }} />
          </div>
          <Link href="/delivery-notes" className="text-sm font-semibold text-[#3b6fd4] hover:underline">
            {row.original.deliveryNo}
          </Link>
        </div>
      ),
    },
    {
      accessorKey: 'customerName',
      header: ({ column }) => (
        <button
          className="flex items-center gap-1 text-[10px] font-semibold text-[#6b7a99] uppercase tracking-wider hover:text-[#1a2340] transition-colors"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Customer
          {column.getIsSorted() === 'asc'  ? <ArrowUp size={11} /> :
           column.getIsSorted() === 'desc' ? <ArrowDown size={11} /> :
           <ArrowUpDown size={11} />}
        </button>
      ),
      cell: ({ getValue }) => (
        <span className="text-sm text-[#1a2340]">{(getValue() as string) ?? '-'}</span>
      ),
    },
    {
      accessorKey: 'invoiceNo',
      header: () => <span className="text-[10px] font-semibold text-[#6b7a99] uppercase tracking-wider">Invoice No</span>,
      cell: ({ getValue }) => <span className="text-sm text-[#6b7a99]">{(getValue() as string) ?? '-'}</span>,
    },
    {
      accessorKey: 'shipmentNo',
      header: () => <span className="text-[10px] font-semibold text-[#6b7a99] uppercase tracking-wider">Shipment No</span>,
      cell: ({ getValue }) => <span className="text-sm text-[#6b7a99]">{(getValue() as string) ?? '-'}</span>,
    },
    {
      accessorKey: 'purchaseOrderNo',
      header: () => <span className="text-[10px] font-semibold text-[#6b7a99] uppercase tracking-wider">PO No</span>,
      cell: ({ getValue }) => <span className="text-sm text-[#6b7a99]">{(getValue() as string) ?? '-'}</span>,
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <button
          className="flex items-center gap-1 text-[10px] font-semibold text-[#6b7a99] uppercase tracking-wider hover:text-[#1a2340] transition-colors"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Date
          {column.getIsSorted() === 'asc'  ? <ArrowUp size={11} /> :
           column.getIsSorted() === 'desc' ? <ArrowDown size={11} /> :
           <ArrowUpDown size={11} />}
        </button>
      ),
      cell: ({ getValue }) => (
        <span className="text-sm text-[#6b7a99]">{fmt(getValue() as string)}</span>
      ),
    },
    {
      accessorKey: 'status',
      header: () => <span className="text-[10px] font-semibold text-[#6b7a99] uppercase tracking-wider">Status</span>,
      cell: ({ getValue }) => {
        const status = getValue() as string | null;
        const { bg, color } = getStatusStyle(status);
        return (
          <span
            className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-sm"
            style={{ background: bg, color }}
          >
            <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: color }} />
            {status ?? '-'}
          </span>
        );
      },
    },
  ], []);

  const table = useReactTable({
    data:                    notes,
    columns,
    state:                   { sorting, globalFilter, pagination: { pageIndex: 0, pageSize } },
    onSortingChange:         setSorting,
    onGlobalFilterChange:    setGlobalFilter,
    getCoreRowModel:         getCoreRowModel(),
    getSortedRowModel:       getSortedRowModel(),
    getFilteredRowModel:     getFilteredRowModel(),
    getPaginationRowModel:   getPaginationRowModel(),
  });

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-5 py-3 gap-3">
        <div className="relative w-64">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7a99]" />
          <Input
            placeholder="Search delivery notes..."
            value={globalFilter}
            onChange={e => setGlobalFilter(e.target.value)}
            className="pl-8 h-8 text-xs rounded-none border-[#dde3f0] focus:border-[#3b6fd4]"
          />
        </div>
        <Link href="/delivery-notes">
          <Button
            size="sm"
            className="h-8 text-xs rounded-none gap-1.5"
            style={{ background: '#3b6fd4', color: '#fff', border: 'none' }}
          >
            <FileText size={13} /> View All
          </Button>
        </Link>
      </div>

      <Separator className="bg-[#dde3f0]" />

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            {table.getHeaderGroups().map(hg => (
              <tr key={hg.id} style={{ background: '#f8f9fc', borderBottom: '1px solid #dde3f0' }}>
                {hg.headers.map(header => (
                  <th key={header.id} className="px-4 py-3 text-left font-medium whitespace-nowrap">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-8 text-xs text-[#6b7a99]">
                  No delivery notes found
                </td>
              </tr>
            ) : table.getRowModel().rows.map(row => (
              <tr
                key={row.id}
                className="border-b border-[#f0f2f5] hover:bg-[#f8f9fc] transition-colors"
              >
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className="px-4 py-3 whitespace-nowrap">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Separator className="bg-[#dde3f0]" />

      {/* Pagination */}
      <div className="flex items-center justify-between px-5 py-3 flex-wrap gap-3">
        <div className="text-xs text-[#6b7a99]">
          Showing <span className="font-semibold text-[#1a2340]">{table.getState().pagination.pageIndex * pageSize + 1}</span> to{' '}
          <span className="font-semibold text-[#1a2340]">
            {Math.min((table.getState().pagination.pageIndex + 1) * pageSize, table.getFilteredRowModel().rows.length)}
          </span> of{' '}
          <span className="font-semibold text-[#1a2340]">{total}</span> delivery notes
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-[#6b7a99]">
            Rows
            <Select value={String(pageSize)} onValueChange={v => setPageSize(Number(v))}>
              <SelectTrigger className="h-7 w-16 text-xs rounded-none border-[#dde3f0]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[5, 10, 20, 50].map(s => (
                  <SelectItem key={s} value={String(s)} className="text-xs">{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
              className="btn-ghost p-1 disabled:opacity-40"
              aria-label="First page"
            >
              <ChevronsLeft size={14} style={{ color: '#6b7a99' }} />
            </button>
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="btn-ghost p-1 disabled:opacity-40"
              aria-label="Previous page"
            >
              <ChevronLeft size={14} style={{ color: '#6b7a99' }} />
            </button>

            <span className="text-xs text-[#6b7a99] px-2">
              Page <span className="font-semibold text-[#1a2340]">{table.getState().pagination.pageIndex + 1}</span> of{' '}
              <span className="font-semibold text-[#1a2340]">{table.getPageCount()}</span>
            </span>

            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="btn-ghost p-1 disabled:opacity-40"
              aria-label="Next page"
            >
              <ChevronRight size={14} style={{ color: '#6b7a99' }} />
            </button>
            <button
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
              className="btn-ghost p-1 disabled:opacity-40"
              aria-label="Last page"
            >
              <ChevronsRight size={14} style={{ color: '#6b7a99' }} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecentDeliveryNotes;