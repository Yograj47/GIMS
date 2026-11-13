import { SettingsPageHeader, SettingsSearch } from "@/features/settings/components/SettingsPageHeader";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Plus, LayoutGrid } from "lucide-react";
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
        <div className="min-w-0">
            <SettingsPageHeader title="Categories" description="Organize products into categories." icon={LayoutGrid}>
                <AdminGate><Button onClick={() => { setSelectedCategory(null); setIsModalOpen(true);; }}><Plus size={16} /> Add category</Button></AdminGate>
            </SettingsPageHeader>
            <SettingsSearch label="Search categories" value={searchQuery} onChange={(value) => {
                setSearchQuery(value);
                setPagination((previous) => ({ ...previous, pageIndex: 0 }));
            }} />

            <div className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white">
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