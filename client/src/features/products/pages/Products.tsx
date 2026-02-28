import React, { useEffect, useState, useMemo } from 'react';
import { Plus, PackageSearch, Search, FilterX, AlertTriangle } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useProducts } from '../hooks/useProducts';
import { DataTable } from '@/components/common/DataTable';
import { getProductColumns } from '../components/ProductColumns';
import { useDebounce } from '@/lib/debounce';

const Products: React.FC = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");
    const [stockLevel, setStockLevel] = useState<string>("All Levels");
    
    // Limits API calls while typing
    const debouncedSearch = useDebounce(searchQuery, 600);

    const { products, fetchProducts, isLoading, meta } = useProducts();
    
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    });

    useEffect(() => {
        fetchProducts(
            pagination.pageIndex + 1, 
            pagination.pageSize, 
            debouncedSearch, 
            stockLevel === "All Levels" ? "" : stockLevel
        );
    }, [fetchProducts, pagination.pageIndex, pagination.pageSize, debouncedSearch, stockLevel]);

    const columns = useMemo(() => getProductColumns(navigate), [navigate]);

    const resetFilters = () => {
        setSearchQuery("");
        setStockLevel("All Levels");
        setPagination(prev => ({ ...prev, pageIndex: 0 }));
    };

    return (
        <div className="flex flex-col h-full space-y-6 animate-in fade-in duration-500">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase flex items-center gap-2">
                        <PackageSearch className="text-blue-600" size={28} />
                        Inventory Catalog
                    </h1>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">
                        Total Items: {meta?.totalItems || 0}
                    </p>
                </div>
                <Button
                    onClick={() => navigate("/products/add")}
                    className="bg-blue-600 hover:bg-blue-700 h-11 px-6 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-blue-100 active:scale-95 transition-all"
                >
                    <Plus className="mr-2 h-4 w-4" strokeWidth={4} />
                    New Product
                </Button>
            </div>

            {/* Toolbar */}
            <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center gap-3">
                
                {/* Search Bar (Handles Name & Category) */}
                <div className="relative flex-1 min-w-70">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} strokeWidth={3} />
                    <Input
                        placeholder="SEARCH NAME OR CATEGORY..."
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setPagination(prev => ({ ...prev, pageIndex: 0 }));
                        }}
                        className="pl-11 h-11 rounded-xl text-[10px] font-black uppercase tracking-wide border-none outline-0 focus-within::outline-0"
                    />
                </div>

                <div className="h-8 w-px bg-slate-100 hidden md:block" />

                {/* Stock Level Filter */}
                <div className="relative">
                    <AlertTriangle className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} strokeWidth={3} />
                    <select 
                        value={stockLevel}
                        onChange={(e) => {
                            setStockLevel(e.target.value);
                            setPagination(prev => ({ ...prev, pageIndex: 0 }));
                        }}
                        className="h-11 w-48 bg-slate-50/50 border border-slate-100 rounded-xl text-[12px] font-black text-slate-600 uppercase tracking-widest pl-10 pr-8 appearance-none cursor-pointer outline-none focus:ring-2 focus:ring-blue-500/10"
                    >
                        <option>All Levels</option>
                        <option value="low">Low Stock</option>
                        <option value="out">Out of Stock</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 1L5 5L9 1"/></svg>
                    </div>
                </div>

                <Button 
                    variant="ghost" 
                    onClick={resetFilters}
                    className="h-11 w-11 p-0 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50"
                >
                    <FilterX size={18} strokeWidth={2.5} />
                </Button>
            </div>

            {/* Table */}
            <div className="flex-1 min-h-0">
                <DataTable 
                    columns={columns} 
                    data={products || []} 
                    isLoading={isLoading}
                    rowCount={meta?.totalItems || 0}
                    pageCount={meta?.totalPages || 0}
                    pagination={pagination}
                    setPagination={setPagination}
                />
            </div>
        </div>
    );
};

export default Products;