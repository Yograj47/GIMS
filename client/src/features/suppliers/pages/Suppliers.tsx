import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Search, RotateCcw, Truck } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/common/DataTable';
import { useSuppliers } from '../hooks/useSuppliers';
import { getSupplierColumns } from '../components/SupplierColumns';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/lib/debounce';

const Suppliers: React.FC = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");
    const debouncedSearch = useDebounce(searchQuery, 400);

    const { Suppliers, fetchSuppliers, isLoading, meta } = useSuppliers();
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

    useEffect(() => {
        fetchSuppliers(pagination.pageIndex + 1, pagination.pageSize, debouncedSearch);
    }, [fetchSuppliers, pagination.pageIndex, pagination.pageSize, debouncedSearch]);

    const columns = useMemo(() => getSupplierColumns(navigate), [navigate]);

    return (
        <div className="h-full bg-slate-50/50 animate-in fade-in duration-500 pb-10">
            <div className="max-w-350 mx-auto space-y-6">

                {/* 1. Minimal Header */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-200 pb-6">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-blue-600 rounded-lg text-white shadow-lg shadow-blue-100">
                            <Truck size={20} />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900 tracking-tight uppercase">
                                Suppliers
                            </h1>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                {meta?.totalItems || 0} Total Records • System Active
                            </p>
                        </div>
                    </div>

                    <Button
                        onClick={() => navigate("/suppliers/add")}
                        className="h-9 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-sm text-[11px] font-bold uppercase tracking-wider transition-all shadow-sm"
                    >
                        <Plus className="mr-2 h-4 w-4" strokeWidth={3} /> Add Supplier
                    </Button>
                </div>

                {/* 2. Precision Toolbar */}
                <div className="flex flex-col lg:flex-row gap-3">
                    <div className="relative flex-1 group">
                        <Search
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors"
                            size={14}
                            strokeWidth={2.5}
                        />
                        <Input
                            placeholder="Search by name, contact or location..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setPagination(prev => ({ ...prev, pageIndex: 0 }));
                            }}
                            className="w-full h-10 pl-10 bg-white border-slate-200 rounded-sm text-sm focus-visible:ring-1 focus-visible:ring-blue-500 shadow-none"
                        />
                    </div>

                    <Button
                        variant="outline"
                        disabled={!searchQuery}
                        onClick={() => setSearchQuery("")}
                        className="h-10 border-slate-200 text-slate-500 hover:bg-slate-50 rounded-sm text-[11px] font-bold uppercase"
                    >
                        <RotateCcw className="mr-2 h-3 w-3" /> Reset
                    </Button>
                </div>

                {/* 3. The Data Table Wrapper */}
                <div className="bg-white border border-slate-200 shadow-sm">
                    <DataTable
                        columns={columns}
                        data={Suppliers || []}
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

export default Suppliers;