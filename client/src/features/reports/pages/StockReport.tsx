import { PageHeader } from "@/components/common/PageHeader";
import { Search, Download, Filter, PackageSearch } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useProducts } from "@/features/products/hooks/useProducts";
import { Link, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { DataTable } from "@/components/common/DataTable";
import { stockColumns } from "../components/StockColumns";
import { exportToCSV } from "@/lib/csvExport";
import { notify } from "@/lib/toast";
import { Loading } from "@/lib/loader";
import { useDebounce } from "@/lib/debounce";
import { AdminGate } from "@/features/auth/components/AdminGate";
import type { ProductData } from "@/types/product";
import { StockReconciliation } from "../components/StockReconciliation";
import { useAuthStore } from "@/store/authStore";

export default function StockReport() {
    const { fetchProducts, products, isLoading, meta } = useProducts();
    const [searchQuery, setSearchQuery] = useState("");
    const [searchParams, setSearchParams] = useSearchParams();
    const reconcile = searchParams.get("view") === "reconciliation";
    const requestedLevel = searchParams.get("level");
    const stockLevel = requestedLevel === "low" || requestedLevel === "out" || requestedLevel === "healthy"
        ? requestedLevel
        : "";
    const user = useAuthStore((state) => state.user);
    const [isExporting, setIsExporting] = useState<boolean>(false);
    const debouncedSearch = useDebounce(searchQuery, 500);

    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    });

    useEffect(() => {
        if (reconcile) {
            void fetchProducts(undefined, undefined, undefined, undefined, undefined, true);
        } else if (!isExporting) {
            fetchProducts(
                pagination.pageIndex + 1,
                pagination.pageSize,
                debouncedSearch,
                undefined,
                stockLevel
            );
        }
    }, [fetchProducts, pagination, debouncedSearch, stockLevel, isExporting, reconcile]);

    const handleExport = async () => {
        try {
            setIsExporting(true);
            
            const exportData = await fetchProducts(
                1,
                1000,
                searchQuery,
                undefined,
                stockLevel,
                true
            );

            const itemsToExport = Array.isArray(exportData) ? exportData : products;

            if (itemsToExport && itemsToExport.length > 0) {
                const rows = itemsToExport.map((p: ProductData) => ({
                    "Date": new Date(p.createdAt).toLocaleString(),
                    "Product": p.name || "N/A",
                    "Base Price": p.basePrice,
                    "Selling Price": p.sellingPrice,
                    "Quantity": p.quantity,
                    "Threshold": p.threshold,
                    "Stock Value": p.sellingPrice * p.quantity
                }));

                exportToCSV(rows, `Stock_Movement_${new Date().toISOString().split('T')[0]}`);
                notify.success("Export Complete");
            } else {
                notify.error("No items available to export");
            }
        } catch {
            notify.error("Failed to export stock report");
        } finally {
            setIsExporting(false);
            
            fetchProducts(
                pagination.pageIndex + 1,
                pagination.pageSize,
                searchQuery,
                undefined,
                stockLevel
            );
        }
    };

    return (
        <div className={reconcile ? "space-y-3" : "space-y-3 lg:flex lg:h-[calc(100dvh-2.5rem)] lg:flex-col"}>

                <PageHeader title="Stock report" icon={PackageSearch}>
                    {!reconcile && <AdminGate allowedRoles={["admin", "owner"]}>
                        <Button
                            onClick={handleExport}
                            disabled={isExporting}
                            className="h-9 px-5 bg-brand-600 hover:bg-brand-700 text-white rounded-sm text-[11px] font-bold uppercase tracking-wider transition-all shadow-sm"
                        >
                            {isExporting ? (
                                <><Loading className="mr-2" /> Processing...</>
                            ) : (
                                <><Download size={14} className="mr-2" /> Export CSV</>
                            )}
                        </Button>
                    </AdminGate>}
                </PageHeader>

                <nav aria-label="Stock report views" className="flex flex-wrap gap-2">
                    {[{ label: "Inventory levels", selected: !reconcile }, { label: "Stock reconciliation", selected: reconcile }].map(({ label, selected }, index) => {
                        const params = new URLSearchParams(searchParams);
                        if (index === 1) params.set("view", "reconciliation");
                        else params.delete("view");
                        return <Button key={label} asChild size="sm" variant={selected ? "secondary" : "ghost"}>
                            <Link to={{ search: params.toString() }} aria-current={selected ? "page" : undefined}>{label}</Link>
                        </Button>;
                    })}
                </nav>

                {!reconcile && <DataTable fill
                    toolbar={(
                <div className="flex flex-col lg:flex-row gap-3">
                    {/* Search Field */}
                    <div className="relative flex-1 group">
                        <Search
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-subtle-foreground group-focus-within:text-link transition-colors"
                            size={14}
                            strokeWidth={2.5}
                        />
                        <Input
                            aria-label="Search stock" placeholder="Search stock"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-10 pl-10 bg-card border-border rounded-sm text-sm focus-visible:ring-1 focus-visible:ring-brand-500 transition-all shadow-none placeholder:text-slate-300"
                        />
                    </div>

                    {/* Stock Level Filter */}
                    <div className="relative min-w-50">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                            <Filter size={12} className="text-subtle-foreground" strokeWidth={3} />
                        </div>
                        <select
                            aria-label="Stock level"
                            value={stockLevel}
                            onChange={(e) => {
                                setSearchParams(e.target.value ? { level: e.target.value } : {}, { replace: true });
                                setPagination((previous) => ({ ...previous, pageIndex: 0 }));
                            }}
                            className="w-full h-10 pl-9 pr-8 bg-card border border-border rounded-sm text-[11px] font-bold uppercase tracking-tight text-muted-foreground outline-none hover:border-input focus:border-brand-500 appearance-none cursor-pointer transition-all"
                        >
                            <option value="">All Levels</option>
                            <option value="low">Low Stock</option>
                            <option value="healthy">Healthy Stock</option>
                            <option value="out">Out of Stock</option>
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-subtle-foreground">
                            <svg width="8" height="8" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M1 1L5 5L9 1" /></svg>
                        </div>
                    </div>
                </div>

                    )}
                        columns={stockColumns}
                        data={products || []}
                        rowCount={meta?.totalItems || 0}
                        pageCount={meta?.totalPages || 0}
                        pagination={pagination}
                        setPagination={setPagination}
                        isLoading={isLoading}
                />}
                {reconcile && user?.isVerified && <StockReconciliation
                    products={products}
                    canWrite={user.role === "admin" || user.role === "owner"}
                />}
        </div>
    );
}
