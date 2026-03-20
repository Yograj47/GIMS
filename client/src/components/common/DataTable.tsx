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
        <div className="flex flex-col h-full bg-white border border-slate-200">
            <div className="flex-1 overflow-auto custom-scrollbar">
                <Table className="w-full border-separate border-spacing-0">
                    <TableHeader className="sticky top-0 z-20 bg-slate-50/80 backdrop-blur-sm">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className="hover:bg-transparent">
                                {headerGroup.headers.map((header) => (
                                    <TableHead
                                        key={header.id}
                                        className="h-11 px-6 text-[11px] font-bold text-slate-500 uppercase tracking-tight border-b border-slate-200"
                                    >
                                        {flexRender(header.column.columnDef.header, header.getContext())}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-64 text-center">
                                    <div className="flex flex-col items-center justify-center gap-2">
                                        <Loading size="md" />
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                            Synchronizing...
                                        </span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : table.getRowModel().rows.length ? (
                            table.getRowModel().rows.map((row) => (
                                <React.Fragment key={row.id}>
                                    <TableRow
                                        className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors cursor-default"
                                        onClick={() => row.toggleExpanded()} 
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id} className="px-6 py-3 text-sm text-slate-600 border-b border-slate-100">
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                    {row.getIsExpanded() && renderExpandedRow && (
                                        <TableRow className="bg-slate-50/30">
                                            <TableCell colSpan={columns.length} className="p-0 border-b border-slate-200">
                                                {renderExpandedRow(row)}
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </React.Fragment>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-32 text-center text-slate-400 text-xs italic">
                                    No records found for the current criteria.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="border-t border-slate-200 bg-white px-4 py-3">
                <DataTablePagination table={table} totalItems={rowCount} />
            </div>
        </div>
    )
}