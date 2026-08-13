import { useState, useCallback } from 'react';
import { notify } from '@/lib/toast';
import { CategoryService } from '../api/category.service';
import type { CategoryData, CategoryFormData } from '@/types/category';
import type { PaginationMetadata } from '@/types/pagination';

export const useCategories = () => {
    const [categories, setCategories] = useState<CategoryData[]>([]);
    const [singleCategory, setSingleCategory] = useState<CategoryData | null>(null);
    const [isLoading, setLoading] = useState(false);
    const [meta, setMeta] = useState<PaginationMetadata | null>(null);

    const fetchCategories = useCallback(async (page?: number, limit?: number, search?: string, all?: boolean) => {
        try {
            setLoading(true);
            const response = await CategoryService.getAll(page, limit, search, all);
            if (response.success) {
                setCategories(response.data as CategoryData[]);
                setMeta(all ? null : (response.meta || null));
                return true;
            }
        } finally {
            setLoading(false);
        }
    }, [setLoading]);

    const fetchCategoryById = useCallback(async (id: string) => {
        try {
            setLoading(true);
            const response = await CategoryService.getById(id);
            if (response.success) {
                const data = response.data as CategoryData;
                setSingleCategory(data);
                return data;
            }
        } finally {
            setLoading(false);
        }
    }, [setLoading]);

    const addCategory = async (payload: CategoryFormData) => {
        try {
            setLoading(true);
            const response = await CategoryService.create(payload);
            if (response.success) {
                setCategories((prev) => [...prev, response.data as CategoryData]);
                notify.success("Category added successfully");
                return true;
            }
        } finally {
            setLoading(false);
        }
        return false;
    };

    const updateCategory = async (id: string, payload: CategoryFormData) => {
        try {
            setLoading(true);
            const response = await CategoryService.updateById(id, payload);
            if (response.success) {
                setCategories((prev) => prev.map((c) => (c._id === id ? (response.data as CategoryData) : c)));
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
                notify.success("Category removed");
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
        removeCategory,
        meta
    };
};