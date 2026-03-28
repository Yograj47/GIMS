import React, { useEffect, useState, useMemo } from 'react';
import { Plus, PackageSearch, Search, RotateCcw } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useProducts } from '../hooks/useProducts';
import { DataTable } from '@/components/common/DataTable';
import { getProductColumns } from '../components/ProductColumns';
import { useDebounce } from '@/lib/debounce';
import { useCategories } from '@/features/category/hooks/useCategories';
import Select from "react-select";


const Products: React.FC = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");
    const [selectCategory, setSelectCategory] = useState("");
    const [stockLevel, setStockLevel] = useState<string>("All Levels");
    const debouncedSearch = useDebounce(searchQuery, 400);

    const { products, fetchProducts, isLoading, meta } = useProducts();
    const { categories, fetchCategories } = useCategories();
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

    useEffect(() => {
        const fetch = async () => {
            await Promise.all([
                fetchProducts(
                    pagination.pageIndex + 1,
                    pagination.pageSize,
                    debouncedSearch,
                    selectCategory,
                    stockLevel === "All Levels" ? "" : stockLevel
                ),
                fetchCategories(undefined, undefined, undefined, true)
            ])
        }
        fetch();
    }, [fetchProducts, fetchCategories, pagination.pageIndex, pagination.pageSize, debouncedSearch, selectCategory, stockLevel]);

    const categoryOptions = useMemo(() => {
        return [
            { value: "", label: "ALL CATEGORIES" },
            ...(categories?.map(cat => ({
                value: cat._id,
                label: cat.name.toUpperCase()
            })) || [])
        ];
    }, [categories]);

    const customSelectStyles = {
        control: (base: any) => ({
            ...base,
            height: '40px',
            minHeight: '40px',
            borderRadius: '2px',
            borderColor: '#cbd5e1',
            fontSize: '11px',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            boxShadow: 'none',
            '&:hover': { borderColor: '#cbd5e1' }
        }),
        option: (base: any) => ({
            ...base,
            fontSize: '11px',
            fontWeight: 'bold',
            textTransform: 'uppercase',
        })
    };

    console.log(selectCategory);


    const columns = useMemo(() => getProductColumns(navigate), [navigate]);

    return (
        <div className="h-full bg-slate-50/50 animate-in fade-in duration-500">
            <div className="max-w-400 mx-auto space-y-6">

                {/* 1. Minimal Header */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-300 pb-6">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-blue-600 rounded-lg text-white shadow-lg shadow-blue-100">
                            <PackageSearch size={20} />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900 tracking-tight uppercase">
                                Products
                            </h1>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                {meta?.totalItems || 0} Total Records • System Active
                            </p>
                        </div>
                    </div>

                    <Button
                        onClick={() => navigate("/products/add")}
                        className="h-9 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-sm text-[11px] font-bold uppercase tracking-wider transition-all shadow-sm"
                    >
                        <Plus className="mr-2 h-4 w-4" strokeWidth={3} /> Add Product
                    </Button>
                </div>

                {/* 2. Precision Toolbar */}
                <div className="flex flex-col lg:flex-row gap-3">

                    {/* Search Field */}
                    <div className="relative flex-1 group">
                        <Search
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors"
                            size={14}
                            strokeWidth={2.5}
                        />
                        <Input
                            placeholder="Filter by name, category..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setPagination(prev => ({ ...prev, pageIndex: 0 }));
                            }}
                            className="w-full h-10 pl-10 bg-white border-slate-300 rounded-sm text-sm focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:border-blue-500 transition-all shadow-none"
                        />
                    </div>

                    {/* Stock Filter */}
                    <div className="relative min-w-50">
                        <select
                            value={stockLevel}
                            onChange={(e) => {
                                setStockLevel(e.target.value);
                                setPagination(prev => ({ ...prev, pageIndex: 0 }));
                            }}
                            className="w-full h-10 bg-white border border-slate-300 rounded-sm px-3 text-[11px] font-bold uppercase tracking-tight text-slate-600 outline-none hover:border-slate-300 focus:border-blue-500 appearance-none cursor-pointer transition-all"
                        >
                            <option>All Levels</option>
                            <option value="healthy">Healthy</option>
                            <option value="low">Low Stock Warning</option>
                            <option value="out">Out of Stock</option>
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                            <svg width="8" height="8" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M1 1L5 5L9 1" /></svg>
                        </div>
                    </div>

                    {/* Category Filter */}
                    <div className="min-w-50">
                        <Select
                            placeholder="CATEGORY"
                            options={categoryOptions}
                            value={categoryOptions.find(opt => opt.value === selectCategory)}
                            onChange={(newValue: any) => {
                                setSelectCategory(newValue?.value || "");
                                setPagination(prev => ({ ...prev, pageIndex: 0 }));
                            }}
                            styles={customSelectStyles}
                            isClearable
                            className="react-select-container z-50"
                            classNamePrefix="react-select"
                        />
                    </div>

                    {/* Reset Action */}
                    <Button
                        variant="outline"
                        disabled={!searchQuery && stockLevel === "All Levels"}
                        onClick={() => { setSearchQuery(""); setStockLevel("All Levels") }}
                        className="h-10 border-slate-300 text-slate-500 hover:bg-slate-50 rounded-sm text-[11px] font-bold uppercase"
                    >
                        <RotateCcw className="mr-2 h-3 w-3" /> Reset
                    </Button>
                </div>

                {/* 3. The Data Table Wrapper */}
                <div className="bg-white border border-slate-300 shadow-sm">
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
        </div>
    );
};

export default Products;