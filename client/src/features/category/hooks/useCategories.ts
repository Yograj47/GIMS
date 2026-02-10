import { useState, useCallback } from 'react';
import { useGlobalStore } from '@/store/globalStore';
import { notify } from '@/lib/toast';
import { CategoryService } from '../api/CategoryService';
import type { CategoryData, CategoryFormData } from '@/types/Category';

export const useCategories = () => {
    const [categories, setCategories] = useState<CategoryData[]>([]);
    const [singleCategory, setSingleCategory] = useState<CategoryData | null>(null);
    const { setLoading, isLoading } = useGlobalStore();

    // 1. Fetch All Categories
    const fetchCategories = useCallback(async () => {
        try {
            setLoading(true);
            const response = await CategoryService.getAll();
            if (response.status === "Success") {
                setCategories(response.data as CategoryData[]);
            }
        } catch (error: any) {
            // the error notification happens automatically!
        } finally {
            setLoading(false);
        }
    }, [setLoading]);

    // 2. Fetch Single Category (for Edit/View pages)
    const fetchCategoryById = useCallback(async (id: string) => {
        try {
            setLoading(true);
            const response = await CategoryService.getById(id);
            if (response.status === "Success") {
                const data = response.data as CategoryData;
                setSingleCategory(data);
                return data;
            }
        } finally {
            setLoading(false);
        }
    }, [setLoading]);

    // 3. Create Category
    const addCategory = async (payload: CategoryFormData) => {
        try {
            setLoading(true);
            const response = await CategoryService.create(payload);
            if (response.status === "Success") {
                notify.success("Category added successfully");
                return true;
            }
        } finally {
            setLoading(false);
        }
        return false;
    };

    // 4. Update Category
    const updateCategory = async (id: string, payload: CategoryFormData) => {
        try {
            setLoading(true);
            const response = await CategoryService.updateById(id, payload);
            if (response.status === "Success") {
                notify.success("Category updated successfully");
                return true;
            }
        } finally {
            setLoading(false);
        }
        return false;
    };

    // 5. Delete Category
    const removeCategory = async (id: string) => {
        try {
            setLoading(true);
            const response = await CategoryService.delete(id);
            if (response.success || response.status === "Success") {
                setCategories((prev) => prev.filter((c) => c._id !== id));
                notify.success("Product removed");
            }
        } finally {
            setLoading(false);
        }
    };

    return {
        categories,
        singleCategory,
        isLoading,
        fetchCategories,
        fetchCategoryById,
        addCategory,
        updateCategory,
        removeCategory
    };
};