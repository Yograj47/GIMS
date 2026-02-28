import { Search, Download, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useProducts } from "@/features/products/hooks/useProducts";
import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { DataTable } from "@/components/common/DataTable";
import { getStockColumns } from "../../components/StockColumns";
import { cn } from "@/lib/utils";

export default function StockReport() {
    const { fetchProducts, products, isLoading, meta } = useProducts();
    const [searchQuery, setSearchQuery] = useState("");
    const [stockLevel, setStockLevel] = useState<string>("All Levels");
    const navigate = useNavigate();

    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    });

    useEffect(() => {
        // Normalize "All Levels" for the API call
        const levelFilter = stockLevel === "All Levels" ? "" : stockLevel;
        fetchProducts(
            pagination.pageIndex + 1,
            pagination.pageSize,
            searchQuery,
            levelFilter
        );
    }, [fetchProducts, pagination, searchQuery, stockLevel]);

    console.log(products);
    

    const columns = useMemo(() => getStockColumns(navigate), [navigate]);

    return (
        <div className="min-h-full space-y-6 animate-in fade-in duration-500 pb-10">
            {/* Header Section */}
            <div className="flex justify-between items-end">
                <div className="space-y-1">
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase">
                        Stock Report<span className="text-indigo-600">.</span>
                    </h1>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                        Comprehensive view of current inventory status
                    </p>
                </div>
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-5 font-bold text-xs gap-2 h-11 shadow-lg shadow-indigo-100 transition-all">
                    <Download size={16} /> Export CSV
                </Button>
            </div>

            {/* Filter Bar - Theme Consistent Pattern */}
            <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
                {/* Search Group */}
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <Input
                        placeholder="SEARCH PRODUCTS..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-12 h-12 border-none bg-transparent font-bold text-xs tracking-widest focus-visible:ring-0 shadow-none placeholder:text-slate-400 uppercase"
                    />
                </div>
                
                <div className="hidden md:block h-8 w-px bg-slate-200" />
                
                {/* Properly Styled Select Group */}
                <div className="relative w-full md:w-64 px-2">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        <Filter size={16} className="text-indigo-500" />
                    </div>
                    
                    <select 
                        value={stockLevel}
                        onChange={(e) => setStockLevel(e.target.value)}
                        className={cn(
                            "w-full h-12 pl-10 pr-10 bg-slate-50/50 border border-transparent",
                            "rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-700",
                            "appearance-none cursor-pointer outline-none transition-all",
                            "hover:bg-slate-100 focus:border-indigo-100"
                        )}
                    >
                        <option value="All Levels">ALL LEVELS</option>
                        <option value="Low Stock">LOW STOCK</option>
                        <option value="Healthy">HEALTHY STOCK</option>
                    </select>

                    {/* Custom Chevron Arrow */}
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </div>
                </div>
            </div>

            {/* The DataTable Component */}
            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
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
    );
}