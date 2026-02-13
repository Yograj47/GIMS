import { useEffect, useState } from "react";
import { Plus, Tag, Trash2, Edit3, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCategories } from "../hooks/useCategories";
import { format } from "date-fns";
import type { CategoryData, CategoryFormData } from "@/types/Category";
import CategoryFormModal from "../components/CategoryFormModal";

export default function CategoriesPage() {
    const { categories, fetchCategories, removeCategory, isLoading, updateCategory, addCategory } = useCategories();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<CategoryData | null>(null);

    useEffect(() => { fetchCategories(); }, [fetchCategories]);

    // Triggered by the "Add Category" button
    const handleAddClick = (): void => {
        setSelectedCategory(null);
        setIsModalOpen(true);
    };

    // Triggered by the "Edit" button on a category card
    const handleEditClick = (category: CategoryData): void => {
        setSelectedCategory(category);
        setIsModalOpen(true);
    };

    const handleFormSubmit = async (formData: CategoryFormData): Promise<void> => {
        if (selectedCategory) {
            await updateCategory(selectedCategory._id, formData);
        } else {
            await addCategory(formData);
        }
        setIsModalOpen(false);
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Categories</h2>
                    <p className="text-slate-500 text-sm font-medium">Group your products for better organization.</p>
                </div>
                <Button
                    onClick={handleAddClick}
                    className="bg-blue-600 hover:bg-blue-700 h-11 rounded-xl font-bold gap-2 transition-all active:scale-95">
                    <Plus size={18} /> Add Category
                </Button>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => <Skeleton key={i} className="h-40 rounded-[2rem]" />)}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {categories?.map((category) => (
                        <div key={category._id} className="group bg-white border border-slate-200 p-6 rounded-[2rem] hover:border-blue-500 transition-all shadow-sm relative">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-slate-50 text-slate-400 group-hover:bg-blue-600 group-hover:text-white rounded-2xl transition-all">
                                    <Tag size={20} />
                                </div>
                                <div className="flex gap-1">
                                    <button onClick={(e) => {
                                        e.stopPropagation();
                                        handleEditClick(category)
                                    }} className="p-2 text-slate-300 hover:text-blue-600 transition-colors"><Edit3 size={16} /></button>
                                    <button onClick={() => removeCategory(category._id)} className="p-2 text-slate-300 hover:text-red-600 transition-colors"><Trash2 size={16} /></button>
                                </div>
                            </div>
                            <h4 className="font-black text-slate-900 text-lg leading-tight mb-2">{category.name}</h4>
                            <p className="text-slate-500 text-xs line-clamp-2 font-medium mb-4">
                                {category.description || "No description provided."}
                            </p>
                            <div className="pt-4 border-t border-slate-50 flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                <Calendar size={12} />
                                Created {format(new Date(category.createdAt), 'MMM dd, yyyy')}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* The Modal Component */}
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