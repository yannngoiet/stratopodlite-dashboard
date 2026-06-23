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
  type PaginationState,
} from '@tanstack/react-table';
import { Truck, ChevronLeft, ChevronRight, ArrowUp, ArrowDown } from 'lucide-react';
import type { RecentDeliveryNote } from '@/services/dashboardStatsService';

const fmt = (d: string) =>
  new Date(d).toLocaleDateString('en-ZA', { day: '2-digit', month: 'short', year: 'numeric' });

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  AVAILABLE:  { bg: '#dcfce7', color: '#15803d' },
  SIGNED:     { bg: '#dbeafe', color: '#1d4ed8' },
  COMPLETED:  { bg: '#dcfce7', color: '#15803d' },
  PENDING:    { bg: '#fef9c3', color: '#a16207' },
  CANCELLED:  { bg: '#fee2e2', color: '#b91c1c' },
};

const getStatusStyle = (s: string | null) =>
  STATUS_STYLES[s?.toUpperCase() ?? ''] ?? { bg: '#f0f2f5', color: '#6b7a99' };

const RecentDeliveryNotes = ({ notes, total }: { notes: RecentDeliveryNote[]; total: number }) => {
  const [sorting, setSorting]   = useState<SortingState>([]);
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });

  const columns = useMemo<ColumnDef<RecentDeliveryNote>[]>(() => [
    {
      accessorKey: 'deliveryNo',
      header: ({ column }) => (
        <button
          className="flex items-center gap-1 text-sm font-semibold transition-colors bg-transparent border-none p-0 cursor-pointer" style={{ color: '#6b7a99' }}
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Delivery No
          {column.getIsSorted() === 'asc'  ? <ArrowUp size={12} /> :
           column.getIsSorted() === 'desc' ? <ArrowDown size={12} /> : null}
        </button>
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="dash-icon-circle dash-icon-circle-blue w-9 h-9">
            <Truck size={16} className="dash-text-blue" />
          </div>
          <Link href="/delivery-notes" className="text-sm font-medium text-[#6b7a99] hover:text-[#3b6fd4] hover:underline transition-colors">
            {row.original.deliveryNo}
          </Link>
        </div>
      ),
    },
    {
      accessorKey: 'customerName',
      header: ({ column }) => (
        <button
          className="flex items-center gap-1 text-sm font-semibold transition-colors bg-transparent border-none p-0 cursor-pointer" style={{ color: '#6b7a99' }}
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Customer
          {column.getIsSorted() === 'asc'  ? <ArrowUp size={12} /> :
           column.getIsSorted() === 'desc' ? <ArrowDown size={12} /> : null}
        </button>
      ),
      cell: ({ getValue }) => (
        <span className="text-sm text-[#6b7a99]">{(getValue() as string) ?? '-'}</span>
      ),
    },
    {
      accessorKey: 'invoiceNo',
      header: () => <span className="text-sm font-semibold text-[#6b7a99]">Invoice No</span>,
      cell: ({ getValue }) => <span className="text-sm font-medium" style={{ color: '#EF9F27' }}>{(getValue() as string) ?? '-'}</span>,
    },
    {
      accessorKey: 'shipmentNo',
      header: () => <span className="text-sm font-semibold text-[#6b7a99]">Shipment No</span>,
      cell: ({ getValue }) => <span className="text-sm text-[#6b7a99]">{(getValue() as string) ?? '-'}</span>,
    },
    {
      accessorKey: 'purchaseOrderNo',
      header: () => <span className="text-sm font-semibold text-[#6b7a99]">PO No</span>,
      cell: ({ getValue }) => <span className="text-sm text-[#6b7a99]">{(getValue() as string) ?? '-'}</span>,
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <button
          className="flex items-center gap-1 text-sm font-semibold transition-colors bg-transparent border-none p-0 cursor-pointer" style={{ color: '#6b7a99' }}
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Date
          {column.getIsSorted() === 'asc'  ? <ArrowUp size={12} /> :
           column.getIsSorted() === 'desc' ? <ArrowDown size={12} /> : null}
        </button>
      ),
      cell: ({ getValue }) => (
        <span className="text-sm text-[#6b7a99]">{fmt(getValue() as string)}</span>
      ),
    },
    {
      accessorKey: 'status',
      header: () => <span className="text-sm font-semibold text-[#6b7a99]">Status</span>,
      cell: ({ getValue }) => {
        const status = getValue() as string | null;
        const { bg, color } = getStatusStyle(status);
        return (
          <span className="dash-status-pill" style={{ background: bg, color }}>
            <span className="w-1.5 h-1.5 rounded-full inline-block flex-shrink-0" style={{ background: color }} />
            {status ?? '-'}
          </span>
        );
      },
    },
  ], []);

  const table = useReactTable({
    data:                    notes,
    columns,
    state:                   { sorting, pagination },
    onSortingChange:         setSorting,
    onPaginationChange:      setPagination,
    getCoreRowModel:         getCoreRowModel(),
    getSortedRowModel:       getSortedRowModel(),
    getFilteredRowModel:     getFilteredRowModel(),
    getPaginationRowModel:   getPaginationRowModel(),
    manualPagination:        false,
  });

  const { pageIndex, pageSize } = pagination;
  const filteredCount = table.getFilteredRowModel().rows.length;
  const from = filteredCount === 0 ? 0 : pageIndex * pageSize + 1;
  const to   = Math.min((pageIndex + 1) * pageSize, filteredCount);

  return (
    <div>
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
                <td colSpan={columns.length} className="text-center py-10 text-sm text-[#6b7a99]">
                  No delivery notes found
                </td>
              </tr>
            ) : table.getRowModel().rows.map(row => (
              <tr key={row.id} className="dash-table-row">
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className="px-4 py-3.5 whitespace-nowrap">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-5 py-3">
        <span className="text-sm text-[#6b7a99]">
          Showing <span className="font-semibold text-[#1a2340]">{from}</span> to{' '}
          <span className="font-semibold text-[#1a2340]">{to}</span> of{' '}
          <span className="font-semibold text-[#1a2340]">{total}</span> Delivery Notes
        </span>

        <div className="flex items-center gap-1">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="btn-ghost p-1.5 disabled:opacity-30"
            aria-label="Previous page"
          >
            <ChevronLeft size={16} style={{ color: '#6b7a99' }} />
          </button>

          {Array.from({ length: table.getPageCount() }, (_, i) => (
            <button
              key={i}
              onClick={() => table.setPageIndex(i)}
              className="btn-ghost"
              style={{
                minWidth: 32, height: 32, padding: 0,
                fontSize: '0.8rem', fontWeight: 600,
                background: pageIndex === i ? '#1a2340' : 'transparent',
                color:      pageIndex === i ? '#fff' : '#6b7a99',
                borderRadius: 4,
              }}
            >
              {i + 1}
            </button>
          ))}

          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="btn-ghost p-1.5 disabled:opacity-30"
            aria-label="Next page"
          >
            <ChevronRight size={16} style={{ color: '#6b7a99' }} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecentDeliveryNotes;
