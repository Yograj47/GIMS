import {
    flexRender,
    getCoreRowModel,
    getExpandedRowModel,
    useReactTable,
    type ColumnDef,
    type OnChangeFn,
    type PaginationState,
    type Row
} from "@tanstack/react-table"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "../ui/table"

import { DataTablePagination } from "./DataTablePagination"
import { Skeleton } from "@/components/ui/skeleton"
import React from "react"

interface DataTableProps<TData> {
    columns: ColumnDef<TData>[]
    data: TData[]
    pageCount: number
    rowCount: number
    pagination: { pageIndex: number; pageSize: number }
    setPagination: OnChangeFn<PaginationState>
    isLoading: boolean
    emptyState?: React.ReactNode
    renderExpandedRow?: (row: Row<TData>) => React.ReactNode
}

export function DataTable<TData>({
    columns,
    data,
    pageCount,
    rowCount,
    pagination,
    setPagination,
    isLoading,
    emptyState,
    renderExpandedRow
}: DataTableProps<TData>) {
    const [expanded, setExpanded] = React.useState({})

    // eslint-disable-next-line react-hooks/incompatible-library
    const table = useReactTable({
        data,
        columns,
        state: { pagination, expanded },
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        getExpandedRowModel: getExpandedRowModel(),
        manualPagination: true,
        pageCount,
        onExpandedChange: setExpanded,
        getRowCanExpand: () => !!renderExpandedRow,
        getRowId: (record, index) => {
            const id = (record as { _id?: string } | null)?._id
            return id ?? String(index)
        },
    })

    return (
        <div className="flex min-w-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white">
            {isLoading && <span role="status" className="sr-only">Loading records</span>}
            <div aria-busy={isLoading} role="region" aria-label="Table results" tabIndex={0} className="min-w-0 flex-1 overflow-x-auto focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand-600">
                <Table noWrapper className="records-table w-full border-separate border-spacing-0">
                    <TableHeader className="sticky top-0 z-20 bg-slate-50/80 backdrop-blur-sm">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className="hover:bg-transparent">
                                {headerGroup.headers.map((header) => (
                                    <TableHead
                                        key={header.id}
                                        className="h-11 border-b border-slate-200 px-3 text-xs font-semibold text-slate-600 sm:px-5"
                                    >
                                        {flexRender(header.column.columnDef.header, header.getContext())}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            Array.from({ length: Math.min(5, pagination.pageSize) }, (_, rowIndex) => (
                                <TableRow key={rowIndex} aria-hidden="true">
                                    {table.getVisibleLeafColumns().map((column, columnIndex) => (
                                            <TableCell key={column.id} className="px-3 py-4 sm:px-5">
                                            <Skeleton className={columnIndex === 0 ? "h-3 w-24" : "h-3 w-14"} />
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : table.getRowModel().rows.length ? (
                            table.getRowModel().rows.map((row) => (
                                <React.Fragment key={row.id}>
                                    <TableRow
                                        data-record
                                        data-expanded={row.getIsExpanded() || undefined}
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id} className="px-3 py-3 text-sm text-slate-700 sm:px-5">
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                    {row.getIsExpanded() && renderExpandedRow && (
                                        <TableRow className="bg-brand-50/50 hover:bg-brand-50/50">
                                            <TableCell colSpan={columns.length} className="p-0 border-b border-slate-200">
                                                {renderExpandedRow(row)}
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </React.Fragment>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-36 whitespace-normal text-center text-sm text-slate-600">
                                    <div className="flex flex-col items-center gap-3 p-4">
                                        {emptyState ?? "No records found."}
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="border-t border-slate-200 bg-white px-3 py-3 sm:px-4">
                <DataTablePagination table={table} totalItems={rowCount} />
            </div>
        </div>
    )
}
