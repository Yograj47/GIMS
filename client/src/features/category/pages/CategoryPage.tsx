import { useEffect, useState } from "react";
import { Plus, Search, LayoutGrid } from "lucide-react";
import { useCategories } from "../hooks/useCategories";
import CategoryFormModal from "../components/CategoryFormModal";
import type { CategoryData, CategoryFormData } from "@/types/category";
import { DataTable } from "@/components/common/DataTable";
import { getCategoryColumns } from "../components/CategoryColumns";
import { DeleteConfirmDialog } from "@/lib/deleteAlert";
import { useDebounce } from "@/lib/debounce";
import { AdminGate } from "@/features/auth/components/AdminGate";

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
    const debouncedSearch = useDebounce(searchQuery, 400);
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);


    useEffect(() => {
        const timer = setTimeout(() => {
            fetchCategories(pagination.pageIndex + 1, pagination.pageSize, debouncedSearch);
        }, 400);
        return () => clearTimeout(timer);
    }, [fetchCategories, pagination.pageIndex, pagination.pageSize, debouncedSearch]);

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

    const handleDeleteClick = (category: CategoryData) => {
        setSelectedCategory(category);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (selectedCategory) {
            await removeCategory(selectedCategory._id);
            setIsDeleteDialogOpen(false);
            setSelectedCategory(null);
        }
    }

    return (
        <div className="w-full flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-500">

            {/* 1. HEADER SECTION  */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 border-b border-slate-300 pb-6">
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-blue-600 rounded-md text-white shadow-sm">
                        <LayoutGrid size={18} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                            Category Management
                        </h1>
                        <p className="text-slate-500 text-xs mt-1">
                            Product Classification & Organization
                        </p>
                    </div>
                </div>

                <AdminGate>
                    <button
                        onClick={() => { setSelectedCategory(null); setIsModalOpen(true); }}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-black text-[10px] uppercase tracking-[0.15em] px-6 h-10 rounded-sm transition-all active:scale-95 flex items-center gap-2 shadow-sm"
                    >
                        <Plus size={14} strokeWidth={4} />
                        Initialize Category
                    </button>
                </AdminGate>
            </div>

            {/* 2. SEARCH BAR */}
            <div className="mb-4 group">
                <div className="bg-white border border-slate-300 group-within:border-blue-600 rounded-sm p-2 flex items-center gap-3 transition-all">
                    <div className="pl-2 text-slate-400 group-within:text-blue-600 transition-colors">
                        <Search size={16} strokeWidth={3} />
                    </div>
                    <input
                        type="text"
                        placeholder="Search categories..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-slate-600 text-slate-900 font-medium"
                    />
                </div>
            </div>

            {/* 3. DATATABLE SECTION  */}
            <div className="bg-white border border-slate-300 rounded-sm overflow-hidden">
                <DataTable
                    columns={getCategoryColumns(handleEditClick, handleDeleteClick)}
                    data={categories}
                    isLoading={isLoading}
                    pageCount={meta?.totalPages || 0}
                    rowCount={meta?.totalItems || 0}
                    pagination={pagination}
                    setPagination={setPagination}
                />

                <DeleteConfirmDialog
                    open={isDeleteDialogOpen}
                    onOpenChange={setIsDeleteDialogOpen}
                    onConfirm={confirmDelete}
                    title="Confirm Category Deletion"
                    itemName={selectedCategory?.name || "this category"}
                    isLoading={isLoading}
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