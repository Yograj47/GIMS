import {
    flexRender,
    getCoreRowModel,
    getExpandedRowModel,
    useReactTable,
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
import { Loading } from "@/lib/loader"
import React from "react"

interface DataTableProps<TData> {
    columns: any[]
    data: TData[]
    pageCount: number
    rowCount: number
    pagination: { pageIndex: number; pageSize: number }
    setPagination: OnChangeFn<PaginationState>
    isLoading: boolean
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
    renderExpandedRow
}: DataTableProps<TData>) {

    const [expanded, setExpanded] = React.useState({})

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
        getRowCanExpand: () => !!renderExpandedRow
    })

    return (
        <div className="flex flex-col h-full min-h-0">
            {/* Table Container - Rounded with a more subtle border and soft shadow */}
            <div className="flex flex-col flex-1 min-h-0 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">

                {/* Scroll Area */}
                <div className="flex-1 min-h-0 overflow-auto custom-scrollbar">
                    <Table noWrapper className="w-full border-separate border-spacing-0">
                        {/* Header: Using a darker slate for a "Control Center" feel */}
                        <TableHeader className="sticky top-0 z-20">
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id} className="hover:bg-transparent border-none">
                                    {headerGroup.headers.map((header) => (
                                        <TableHead
                                            key={header.id}
                                            className="h-14 px-8 text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-50/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40"
                                        >
                                            {flexRender(header.column.columnDef.header, header.getContext())}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow className="hover:bg-transparent border-none">
                                    <TableCell
                                        colSpan={columns.length}
                                        className="h-100 text-center"
                                    >
                                        <div className="flex flex-col items-center justify-center gap-4">
                                            <Loading size="lg" />
                                            <div className="flex flex-col gap-1">
                                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] animate-pulse">
                                                    Retrieving Data
                                                </p>
                                            </div>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : table.getRowModel().rows.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <React.Fragment key={row.id}>
                                        <TableRow
                                            className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors group cursor-pointer"
                                            onClick={() => row.toggleExpanded()} // Make the whole row clickable
                                        >
                                            {row.getVisibleCells().map((cell) => (
                                                <TableCell key={cell.id} className="px-8 py-4 text-sm text-slate-700">
                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                        {/* RENDER EXPANDED CONTENT HERE */}
                                        {row.getIsExpanded() && renderExpandedRow && (
                                            <TableRow className="hover:bg-transparent border-none">
                                                <TableCell colSpan={columns.length} className="p-0">
                                                    {renderExpandedRow(row)}
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </React.Fragment>
                                ))
                            ) : (
                                <TableRow className="hover:bg-transparent">
                                    <TableCell
                                        colSpan={columns.length}
                                        className="h-100 p-0"
                                    >
                                        <div className="flex flex-col items-center justify-center h-full w-full gap-2">
                                            <span className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">
                                                No results found
                                            </span>
                                            <p className="text-slate-300 text-xs font-medium italic">
                                                Try adjusting your filters
                                            </p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination - Simplified footer */}
                <div className="border-t border-slate-100 bg-white px-6 py-4 shrink-0">
                    <DataTablePagination table={table} totalItems={rowCount} />
                </div>
            </div>
        </div>
    )
}