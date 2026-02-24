import { useEffect, useState } from "react";
import { Plus, Search } from "lucide-react";
import { useCategories } from "../hooks/useCategories";
import CategoryFormModal from "../components/CategoryFormModal";
import type { CategoryData, CategoryFormData } from "@/types/Category";
import { DataTable } from "@/components/common/DataTable";
import { getCategoryColumns } from "../components/CategoryColumns"; // You'll need to create this

export default function CategoryPage() {
    const { 
        categories, 
        fetchCategories, 
        removeCategory, 
        isLoading, 
        updateCategory, 
        addCategory,
        meta
    } = useCategories();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<CategoryData | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

    // Debounced Search & Fetch
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchCategories(pagination.pageIndex + 1, pagination.pageSize, searchQuery);
        }, 400);
        return () => clearTimeout(timer);
    }, [fetchCategories, pagination.pageIndex, pagination.pageSize, searchQuery]);

    const handleEditClick = (category: CategoryData) => {
        setSelectedCategory(category);
        setIsModalOpen(true);
    };

    const handleFormSubmit = async (formData: CategoryFormData) => {
        const success = selectedCategory 
            ? await updateCategory(selectedCategory._id, formData)
            : await addCategory(formData);
        
        if (success) setIsModalOpen(false);
    };

    return (
        <div className="w-full h-full flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-500 min-h-0 px-1">
            
            {/* 1. Header Section */}
            <div className="flex items-end justify-between mb-4 shrink-0">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">
                        Categories<span className="text-blue-600">.</span>
                    </h1>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mt-1">
                        Product Classification Engine
                    </p>
                </div>

                <button
                    onClick={() => { setSelectedCategory(null); setIsModalOpen(true); }}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-black text-[10px] uppercase tracking-widest px-6 py-3 rounded-xl transition-all active:scale-95 flex items-center gap-2 shadow-lg shadow-blue-100"
                >
                    <Plus size={14} strokeWidth={4} />
                    New Category
                </button>
            </div>

            {/* 2. Search Bar */}
            <div className="mb-2 group shrink-0">
                <div className="bg-white border-2 border-slate-200 group-within:border-slate-800 rounded-2xl p-3 flex items-center gap-4 transition-all shadow-sm">
                    <div className="pl-2 text-slate-400 group-within:text-slate-800 transition-colors">
                        <Search size={20} strokeWidth={3} />
                    </div>
                    <input
                        type="text"
                        placeholder="SEARCH BY CATEGORY NAME..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-1 bg-transparent border-none outline-none font-black text-xs uppercase tracking-widest placeholder:text-slate-300 text-slate-800"
                    />
                </div>
            </div>

            {/* 3. DataTable Section */}
            <div className="flex-1 min-h-0 bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                <DataTable
                    columns={getCategoryColumns(handleEditClick, removeCategory)}
                    data={categories}
                    isLoading={isLoading}
                    pageCount={meta?.totalPages || 0}
                    rowCount={meta?.totalItems || 0}
                    pagination={pagination}
                    setPagination={setPagination}
                />
            </div>

            <CategoryFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleFormSubmit}
                initialData={selectedCategory}
                isLoading={isLoading}
            />
        </div>
    );
}