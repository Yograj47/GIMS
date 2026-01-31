import React, { useEffect, useState } from 'react';
import { Search, Plus, Filter, PackageOpen } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Loading } from '@/lib/loader';
import type { SupplierApiResponse } from '@/interface/Supplier';
import SupplierListing from '../components/SupplierListing';

const Suppliers: React.FC = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(false);


    const suppliers: SupplierApiResponse[] = []

    useEffect(() => {
        setIsLoading(true);
        const timer = setTimeout(() => {
            console.log("Simulated data fetch complete.");
            setIsLoading(false);
        }, 2000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Page Title & Add Button */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Supplier Details</h1>
                    <p className="text-slate-500 text-sm font-medium">Total Suppliers: {suppliers.length}</p>
                </div>
                <Button
                    onClick={() => navigate("/suppliers/add")}
                    className="bg-blue-600 hover:bg-blue-700 h-11 px-6 rounded-xl font-bold shadow-lg shadow-blue-100"
                >
                    <Plus className="mr-2 h-5 w-5" strokeWidth={3} />
                    New Supplier
                </Button>
            </div>

            {/* Top Bar Controls */}
            <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-75">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Quick search by name, category, or SKU..."
                        className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-12 pr-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm text-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Button variant="outline" className="rounded-xl border-slate-200 h-12 gap-2 text-slate-600 font-bold">
                    <Filter size={18} />
                    Filters
                </Button>
            </div>

            {/* Table Container */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase">Name</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase">Phone</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase">Address</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="py-20">
                                        <div className="flex justify-center items-center">
                                            <Loading size="lg" />
                                        </div>
                                    </td>
                                </tr>
                            ) : suppliers.length > 0 ? (
                                suppliers.map((s) => (
                                    <SupplierListing key={s.data._id} Supplier={s} />
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="py-20 text-center">
                                        <div className="flex flex-col items-center gap-2 text-slate-400">
                                            <PackageOpen size={48} strokeWidth={1} />
                                            <p className="font-medium">No Suppliers found</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Suppliers;