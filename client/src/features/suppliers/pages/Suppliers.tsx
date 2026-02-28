import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Search} from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/common/DataTable';
import { useSuppliers } from '../hooks/useSuppliers';
import { getSupplierColumns } from '../components/SupplierColumns';
import { Input } from '@/components/ui/input';

const Suppliers: React.FC = () => {
    const navigate = useNavigate();
    const { Suppliers, fetchSuppliers, isLoading, meta } = useSuppliers();

    // Table State
    const [searchQuery, setSearchQuery] = useState("");
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    });

    useEffect(() => {
        // Assuming your hook supports search and pagination params
        fetchSuppliers(pagination.pageIndex + 1, pagination.pageSize, searchQuery);
    }, [fetchSuppliers, pagination, searchQuery]);

    const columns = useMemo(() => getSupplierColumns(navigate), [navigate]);

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-10">
            {/* Page Title & Add Button */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Supplier Network</h1>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Manage your vendors and logistics partners</p>
                </div>
                <Button
                    onClick={() => navigate("/suppliers/add")}
                    className="bg-blue-600 hover:bg-blue-700 h-12 px-6 rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg shadow-blue-100 transition-all active:scale-95"
                >
                    <Plus className="mr-2 h-5 w-5" strokeWidth={4} />
                    Add New Supplier
                </Button>
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
                {/* Search Input Group */}
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <Input
                        placeholder="Search by Name, Contact or Address..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-12 h-12 border-none bg-transparent font-medium focus-visible:ring-0 shadow-none text-sm placeholder:text-slate-400"
                    />
                </div>
            </div>

            {/* Content Area */}
            <div className="bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-sm">
                <DataTable
                    columns={columns}
                    data={Suppliers || []}
                    rowCount={meta?.totalItems || 0}
                    pageCount={meta?.totalPages || 0}
                    pagination={pagination}
                    setPagination={setPagination}
                    isLoading={isLoading}
                />
            </div>

        </div>
    );
};

export default Suppliers;