import { useEffect, useState } from "react";
import { Plus, Search, LayoutGrid } from "lucide-react";
import { useCategories } from "../hooks/useCategories";
import CategoryFormModal from "../components/CategoryFormModal";
import type { CategoryData, CategoryFormData } from "@/types/Category";
import { DataTable } from "@/components/common/DataTable";
import { getCategoryColumns } from "../components/CategoryColumns";

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
        <div className="w-full flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-500">
            
            {/* 1. HEADER SECTION - Unified with Registry Style */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 border-b border-slate-200 pb-6">
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-blue-600 rounded-md text-white shadow-sm">
                        <LayoutGrid size={18} />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-slate-900 tracking-tight uppercase leading-none">
                            Category Management
                        </h1>
                        <p className="text-slate-400 text-[9px] font-bold uppercase tracking-[0.2em] mt-1.5">
                            Product Classification & Taxonomy
                        </p>
                    </div>
                </div>

                <button
                    onClick={() => { setSelectedCategory(null); setIsModalOpen(true); }}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-black text-[10px] uppercase tracking-[0.15em] px-6 h-10 rounded-sm transition-all active:scale-95 flex items-center gap-2 shadow-sm"
                >
                    <Plus size={14} strokeWidth={4} />
                    Initialize Category
                </button>
            </div>

            {/* 2. SEARCH BAR - Flattened & High Contrast */}
            <div className="mb-4 group">
                <div className="bg-white border border-slate-200 group-within:border-blue-600 rounded-sm p-2 flex items-center gap-3 transition-all">
                    <div className="pl-2 text-slate-400 group-within:text-blue-600 transition-colors">
                        <Search size={16} strokeWidth={3} />
                    </div>
                    <input
                        type="text"
                        placeholder="SEARCH REGISTRY..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-1 bg-transparent border-none outline-none font-bold text-[11px] uppercase tracking-widest placeholder:text-slate-300 text-slate-900"
                    />
                </div>
            </div>

            {/* 3. DATATABLE SECTION - Sharp Corners */}
            <div className="bg-white border border-slate-200 rounded-sm overflow-hidden shadow-sm">
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