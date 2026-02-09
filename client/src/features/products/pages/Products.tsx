import React, { useEffect, useState } from 'react';
import { Search, Plus, Filter, PackageOpen } from "lucide-react";
import ProductListing from '../components/ProductListing';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Loading } from '@/lib/loader';
import { useProducts } from '../hooks/useProducts';

const Products: React.FC = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");
    const {products, fetchProducts, isLoading} = useProducts();

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    // Filter products based on search query
    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.name.toLowerCase().includes(searchQuery.toLowerCase()) 
        // p.supplier.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Page Title & Add Button */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Inventory Details</h1>
                    <p className="text-slate-500 text-sm font-medium">
                        Total Products: {isLoading ? "..." : filteredProducts.length}
                    </p>
                </div>
                <Button
                    onClick={() => navigate("/products/add")}
                    className="bg-blue-600 hover:bg-blue-700 h-11 px-6 rounded-xl font-bold shadow-lg shadow-blue-100"
                >
                    <Plus className="mr-2 h-5 w-5" strokeWidth={3} />
                    Add New Product
                </Button>
            </div>

            {/* Top Bar Controls */}
            <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-75">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by name, category, or supplier..."
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
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Product Details</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Category</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Stock Level</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Pricing (₹)</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="py-24">
                                        <div className="flex justify-center items-center">
                                            <Loading size="lg" />
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredProducts.length > 0 ? (
                                filteredProducts.map((p) => (
                                    <ProductListing key={p._id} Product={p} />
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="py-24 text-center">
                                        <div className="flex flex-col items-center gap-3 text-slate-400">
                                            <PackageOpen size={64} strokeWidth={1} className="text-slate-200" />
                                            <div>
                                                <p className="font-bold text-slate-500">No products found</p>
                                                <p className="text-sm">Try adjusting your search or add a new item.</p>
                                            </div>
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

export default Products;