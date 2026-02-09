import api from "@/lib/api";
import type { ProductAPIResponse, ProductFormData } from "@/types/Product";

export const productService = {
    getAll: async () => {
        const { data } = await api.get<ProductAPIResponse>("/products");
        return data;
    },

    getById: async (id: string) => {
        const { data } = await api.get<ProductAPIResponse>(`/products/${id}`);
        return data;
    },

    create: async (payload: ProductFormData) => {
        const { data } = await api.post<ProductAPIResponse>('/products', payload);
        return data;
    },

    // Fixed: Added productId to the URL path
    updateById: async (id: string, payload: ProductFormData) => {
        const { data } = await api.put<ProductAPIResponse>(`/products/${id}`, payload);
        return data;
    },

    delete: async (id: string) => {
        const { data } = await api.delete(`/products/${id}`);
        return data;
    }
};