import api from "@/lib/api";
import type { ApiResponse } from "@/types/api";
import type { ProductFormData } from "@/types/product";

const baseUrl = "/products";

export const productService = {
    getAll: async (page?: number, limit?: number, search?: string, category?: string, stockLevel?: string, all?: boolean) => {
        const { data } = await api.get<ApiResponse>(baseUrl, {
            params: all
                ? { paginate: false, search, category, stockLevel }
                : { page, limit, search, category, stockLevel }
        });
        return data;
    },

    getById: async (id: string) => {
        const { data } = await api.get<ApiResponse>(`${baseUrl}/${id}`);
        return data;
    },

    create: async (payload: ProductFormData) => {
        const { data } = await api.post<ApiResponse>(baseUrl, payload);
        return data;
    },

    updateById: async (id: string, payload: ProductFormData) => {
        const { data } = await api.put<ApiResponse>(`${baseUrl}/${id}`, payload);
        return data;
    },

    delete: async (id: string) => {
        const { data } = await api.delete(`${baseUrl}/${id}`);
        return data;
    }
};