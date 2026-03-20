import { Search, Download, Filter, PackageSearch } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useProducts } from "@/features/products/hooks/useProducts";
import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { DataTable } from "@/components/common/DataTable";
import { getStockColumns } from "../components/StockColumns";
import { exportToCSV } from "@/lib/csvExport";
import { notify } from "@/lib/toast";
import { Loading } from "@/lib/loader";

export default function StockReport() {
    const { fetchProducts, products, isLoading, meta } = useProducts();
    const [searchQuery, setSearchQuery] = useState("");
    const [stockLevel, setStockLevel] = useState<string>("All Levels");
    const navigate = useNavigate();
    const [IsExporting, setIsExporting] = useState<boolean>(false);


    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    });

    useEffect(() => {
        if (!IsExporting) {
            const levelFilter = stockLevel === "All Levels" ? "" : stockLevel;
            fetchProducts(
                pagination.pageIndex + 1,
                pagination.pageSize,
                searchQuery,
                levelFilter
            );
        }
    }, [fetchProducts, pagination, searchQuery, stockLevel]);

    const handleExport = () => {

        setIsExporting(true);
        const levelFilter = stockLevel === "All Levels" ? "" : stockLevel;
        fetchProducts(
            1,
            1000,
            searchQuery,
            levelFilter,
            true
        );
    };

    useEffect(() => {
        if (IsExporting && !isLoading && products.length > 0) {

            const rows = products.map(p => ({
                "Date": new Date(p.createdAt).toLocaleString(),
                "Product": p.name || "N/A",
                "Base Price": p.basePrice,
                "Selling Price": p.sellingPrice,
                "Quantity": p.quantity,
                "Threshold": p.threshold,
                "Stock Value": p.sellingPrice * p.quantity
            }));

            exportToCSV(rows, `Stock_Movement_${new Date().toISOString().split('T')[0]}`);
            setIsExporting(false);

            const levelFilter = stockLevel === "All Levels" ? "" : stockLevel;
            fetchProducts(
                pagination.pageIndex + 1,
                pagination.pageSize,
                searchQuery,
                levelFilter
            );
            notify.success("Export Complete");
        }
    }, [IsExporting, isLoading, products]);


    const columns = useMemo(() => getStockColumns(navigate), [navigate]);

    return (
        <div className="h-full animate-in fade-in duration-500">
            <div className="max-w-400 mx-auto space-y-6">
                
                {/* 1. PRECISION HEADER */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-200 pb-6">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-blue-600 rounded-sm text-white">
                            <PackageSearch size={20} />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900 tracking-tight uppercase">
                                Stock Report
                            </h1>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                Inventory Valuation • <span className="text-blue-600 italic">Audit Mode</span>
                            </p>
                        </div>
                    </div>

                    <Button 
                        onClick={handleExport} 
                        disabled={IsExporting}
                        className="h-9 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-sm text-[11px] font-bold uppercase tracking-wider transition-all shadow-sm"
                    >
                        {IsExporting ? (
                            <><Loading size="sm" className="mr-2" /> Processing...</>
                        ) : (
                            <><Download size={14} className="mr-2" /> Export CSV</>
                        )}
                    </Button>
                </div>

                {/* 2. PRECISION TOOLBAR (Consistent with Products Page) */}
                <div className="flex flex-col lg:flex-row gap-3">
                    {/* Search Field */}
                    <div className="relative flex-1 group">
                        <Search
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors"
                            size={14}
                            strokeWidth={2.5}
                        />
                        <Input
                            placeholder="Filter stock by name or SKU..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-10 pl-10 bg-white border-slate-200 rounded-sm text-sm focus-visible:ring-1 focus-visible:ring-blue-500 transition-all shadow-none placeholder:text-slate-300"
                        />
                    </div>

                    {/* Stock Level Filter */}
                    <div className="relative min-w-50">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                            <Filter size={12} className="text-slate-400" strokeWidth={3} />
                        </div>
                        <select
                            value={stockLevel}
                            onChange={(e) => setStockLevel(e.target.value)}
                            className="w-full h-10 pl-9 pr-8 bg-white border border-slate-200 rounded-sm text-[11px] font-bold uppercase tracking-tight text-slate-600 outline-none hover:border-slate-300 focus:border-blue-500 appearance-none cursor-pointer transition-all"
                        >
                            <option value="All Levels">All Levels</option>
                            <option value="Low Stock">Low Stock Warning</option>
                            <option value="Healthy">Healthy Inventory</option>
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                            <svg width="8" height="8" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M1 1L5 5L9 1" /></svg>
                        </div>
                    </div>
                </div>

                {/* 3. THE DATA TABLE WRAPPER */}
                <div className="bg-white border border-slate-200 shadow-sm rounded-sm overflow-hidden">
                    <DataTable
                        columns={columns}
                        data={products || []}
                        rowCount={meta?.totalItems || 0}
                        pageCount={meta?.totalPages || 0}
                        pagination={pagination}
                        setPagination={setPagination}
                        isLoading={isLoading}
                    />
                </div>
            </div>
        </div>
    );
}