import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight
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

    // Using your logic here!
    const paginationRange = generatePaginationRange(currentPage, totalPages)

    return (
        <div className="flex items-center justify-between px-2">
            {/* 1. Left side: Selection status */}
            <div className="flex-1 text-sm text-muted-foreground">
                {table.getFilteredSelectedRowModel().rows.length} of{" "}
                {totalItems} row(s) selected.
            </div>

            <div className="flex items-center space-x-6 lg:space-x-8">
                {/* 2. Middle: Rows per page */}
                <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium">Rows per page</p>
                    <Select
                        value={`${meta.pageSize}`}
                        onValueChange={(value) => table.setPageSize(Number(value))}
                    >
                        <SelectTrigger className="h-8 w-17.5">
                            <SelectValue placeholder={meta.pageSize} />
                        </SelectTrigger>
                        <SelectContent side="top">
                            {[10, 20, 30, 40, 50].map((pageSize) => (
                                <SelectItem key={pageSize} value={`${pageSize}`}>
                                    {pageSize}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* 3. Right: Page Navigation using your Range */}
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        className="hidden h-8 w-8 p-0 lg:flex"
                        onClick={() => table.setPageIndex(0)}
                        disabled={!table.getCanPreviousPage()}
                    >
                        <ChevronsLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        className="h-8 w-8 p-0"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>

                    {/* Render the Range numbers */}
                    <div className="flex items-center gap-1">
                        {paginationRange.map((page, i) => (
                            <Button
                                key={i}
                                variant={currentPage === page ? "default" : "outline"}
                                className="h-8 w-8 p-0"
                                disabled={page === "..."}
                                onClick={() => typeof page === "number" && table.setPageIndex(page - 1)}
                            >
                                {page}
                            </Button>
                        ))}
                    </div>

                    <Button
                        variant="outline"
                        className="h-8 w-8 p-0"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        className="hidden h-8 w-8 p-0 lg:flex"
                        onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                        disabled={!table.getCanNextPage()}
                    >
                        <ChevronsRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    )
}