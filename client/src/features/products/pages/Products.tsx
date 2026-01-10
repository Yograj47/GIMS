import React from 'react';
import { Search, Plus, Filter} from "lucide-react";
import type { ProductAPIResponse } from '@/interface/Product';
import ProductListing from '../components/ProductListing';
import { useNavigate } from 'react-router-dom';

const Products: React.FC = () => {
    // Mocking the data based on your specific keys
    const navigate = useNavigate();
    const products: ProductAPIResponse[] = [
        {
            _id: "1",
            name: "Basmati Rice",
            quantity: 20,
            threshold: 50,
            basePrice: 80,
            sellingPrice: 95,
            category: { _id: "cat1", name: "Grains" },
            unit: { _id: "u1", name: "kg" },
            supplier: { _id: "s1", name: "Alpha Traders" },
            isActive: true,
            createdAt: "2024-03-20"
        },
        {
            _id: "2",
            name: "Refined Oil",
            quantity: 120,
            threshold: 30,
            basePrice: 150,
            sellingPrice: 180,
            category: { _id: "cat2", name: "Oils" },
            unit: { _id: "u2", name: "L" },
            supplier: { _id: "s2", name: "Pure Oil Co" },
            isActive: true,
            createdAt: "2024-03-21"
        }
    ];

    return (
        <div className="p-8 bg-[#F9FAFB] min-h-screen font-sans">
            {/* Page Title & Add Button */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Products</h1>
                    <p className="text-gray-500 text-sm mt-1">Manage your grocery inventory items</p>
                </div>
                <button
                onClick={(e) => {
                    e.preventDefault()
                    navigate("/products/add")
                }}
                 className="flex items-center gap-2 bg-[#3b82f6] hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-md active:scale-95">
                    <Plus size={20} strokeWidth={3} />
                    Add Product
                </button>
            </div>

            {/* Controls */}
            <div className="flex gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by name or category..."
                        className="w-full bg-white border border-gray-200 rounded-xl py-3 pl-12 pr-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all shadow-sm"
                    />
                </div>
                <button className="flex items-center gap-2 bg-white border border-gray-200 px-5 py-3 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-all shadow-sm">
                    <Filter size={18} />
                    Filter
                </button>
            </div>

            {/* Product Table */}
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead className="bg-gray-50/50 border-b border-gray-100">
                        <tr className="text-gray-500 text-xs font-bold uppercase tracking-wider">
                            <th className="px-8 py-5">Product Name</th>
                            <th className="px-8 py-5">Category</th>
                            <th className="px-8 py-5">Stock</th>
                            <th className="px-8 py-5">Base Price</th>
                            <th className="px-8 py-5">Selling Price</th>
                            <th className="px-8 py-5 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {products.map((p) => (
                            <ProductListing key={p._id} Product={p} />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Products;