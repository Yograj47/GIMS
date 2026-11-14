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
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
            {/* Context Stats */}
            <div className="text-[12px] font-bold text-foreground uppercase tracking-tighter">
                {table.getFilteredSelectedRowModel().rows.length > 0 ? (
                    <span className="text-link">
                        {table.getFilteredSelectedRowModel().rows.length} rows selected
                    </span>
                ) : (
                    `Total Results: ${totalItems}`
                )}
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                {/* Page Size Selector */}
                <div className="flex items-center gap-2">
                    <p className="text-[11px] font-bold text-foreground uppercase">Size</p>
                    <Select
                        value={`${meta.pageSize}`}
                        onValueChange={(value) => table.setPageSize(Number(value))}
                    >
                        <SelectTrigger aria-label="Rows per page" className="h-8 w-16 text-xs border-input rounded-sm">
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
                        aria-label="Previous page"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-muted-foreground"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        <ChevronLeft size={16} />
                    </Button>

                    <span className="text-xs tabular-nums sm:hidden">{currentPage} / {Math.max(1, totalPages)}</span>
                    <div className="hidden items-center gap-1 sm:flex">
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
                                            : "text-muted-foreground"
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
                        aria-label="Next page"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-subtle-foreground"
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
