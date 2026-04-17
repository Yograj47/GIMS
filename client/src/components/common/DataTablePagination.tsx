import {
    ChevronLeft,
    ChevronRight,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { generatePaginationRange } from "@/lib/pagination"
import type { Table } from "@tanstack/react-table"
import { cn } from "@/lib/utils"

interface DataTablePaginationProps<TData> {
    table: Table<TData>
    totalItems: number
}

export function DataTablePagination<TData>({
    table,
    totalItems,
}: DataTablePaginationProps<TData>) {
    const meta = table.getState().pagination
    const currentPage = meta.pageIndex + 1
    const totalPages = table.getPageCount()
    const paginationRange = generatePaginationRange(currentPage, totalPages)

    return (
        <div className="flex items-center justify-between">
            {/* Context Stats */}
            <div className="text-[12px] font-bold text-slate-800 uppercase tracking-tighter">
                {table.getFilteredSelectedRowModel().rows.length > 0 ? (
                    <span className="text-blue-600">
                        {table.getFilteredSelectedRowModel().rows.length} rows selected
                    </span>
                ) : (
                    `Total Results: ${totalItems}`
                )}
            </div>

            <div className="flex items-center gap-6">
                {/* Page Size Selector */}
                <div className="flex items-center gap-2">
                    <p className="text-[11px] font-bold text-slate-800 uppercase">Size</p>
                    <Select
                        value={`${meta.pageSize}`}
                        onValueChange={(value) => table.setPageSize(Number(value))}
                    >
                        <SelectTrigger className="h-8 w-16 text-xs border-slate-300 rounded-sm">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent side="top">
                            {[10, 20, 50].map((pageSize) => (
                                <SelectItem key={pageSize} value={`${pageSize}`} className="text-xs">
                                    {pageSize}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Navigation Buttons */}
                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        className="h-8 w-8 p-0 text-slate-600"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        <ChevronLeft size={16} />
                    </Button>

                    <div className="flex items-center gap-1">
                        {paginationRange?.map((page, i) => {
                            if (typeof page === "number" && page < 1) return null;

                            return (
                                <Button
                                    key={i}
                                    variant={currentPage === page ? "secondary" : "ghost"}
                                    className={cn(
                                        "h-8 min-w-8 px-2 text-[11px] font-bold rounded-sm",
                                        currentPage === page
                                            ? "bg-black text-white hover:bg-slate-800"
                                            : "text-slate-500"
                                    )}
                                    disabled={page === "..."}
                                    onClick={() => typeof page === "number" && table.setPageIndex(page - 1)}
                                >
                                    {page}
                                </Button>
                            )
                        })
                        }
                    </div>

                    <Button
                        variant="ghost"
                        className="h-8 w-8 p-0 text-slate-400"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        <ChevronRight size={16} />
                    </Button>
                </div>
            </div>
        </div>
    )
}