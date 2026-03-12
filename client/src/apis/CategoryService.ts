import api from "@/lib/api";
import type { CategoryAPIResponse, CategoryFormData } from "@/types/Category";

export const CategoryService = {
    getAll: async (page?: number, limit?: number, search?: string, all?: boolean) => {
        const { data } = await api.get<CategoryAPIResponse>("/categories", {
            params: all
                ? { paginate: false, search }
                : { page, limit, search }
        });
        return data;
    },

    getById: async (id: string) => {
        const { data } = await api.get<CategoryAPIResponse>(`/categories/${id}`);
        return data;
    },

    create: async (payload: CategoryFormData) => {
        const { data } = await api.post<CategoryAPIResponse>('/categories', payload);
        return data;
    },

    updateById: async (id: string, payload: CategoryFormData) => {
        const { data } = await api.put<CategoryAPIResponse>(`/categories/${id}`, payload);
        return data;
    },

    delete: async (id: string) => {
        const { data } = await api.delete(`/categories/${id}`);
        return data;
    }
}

