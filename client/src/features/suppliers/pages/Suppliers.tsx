import React, { useEffect, useState } from 'react';
import { Search, Plus, Filter, Truck } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Loading } from '@/lib/loader';
import SupplierListing from '../components/SupplierListing';
import { useSuppliers } from '../hooks/useSuppliers';

const Suppliers: React.FC = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");
    const { Suppliers, fetchSuppliers, isLoading } = useSuppliers();

    useEffect(() => {
        fetchSuppliers();
    }, [fetchSuppliers]);

    console.log(Suppliers);
    
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Page Title & Add Button */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Supplier Management</h1>
                    <p className="text-slate-500 text-sm font-medium">Manage your vendors and logistics partners</p>
                </div>
                <Button
                    onClick={() => navigate("/suppliers/add")}
                    className="bg-blue-600 hover:bg-blue-700 h-11 px-6 rounded-xl font-bold shadow-lg shadow-blue-100 transition-all active:scale-95"
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
                        placeholder="Search by company name or contact..."
                        className="w-full bg-white border border-slate-300 rounded-xl py-3 pl-12 pr-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-text text-sm font-medium"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Button variant="outline" className="rounded-xl border-slate-300 h-12 gap-2 text-slate-600 font-bold">
                    <Filter size={18} />
                    Filters
                </Button>
            </div>

            {/* Table Container */}
            <div className="bg-white border border-slate-300 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50/50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Supplier Details</th>
                                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Phone Number</th>
                                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Email Address</th>
                                <th className="px-6 py-4 text-right text-xs font-black text-slate-400 uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={4} className="py-32">
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <Loading size="lg" />
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Syncing Vendors</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : Suppliers.length > 0 ? (
                                Suppliers.map((s) => (
                                    <SupplierListing key={s._id} Supplier={s} />
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="py-24 text-center">
                                        <div className="flex flex-col items-center gap-2 text-slate-300">
                                            <Truck size={48} strokeWidth={1} />
                                            <p className="font-bold text-slate-400">No suppliers on record</p>
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