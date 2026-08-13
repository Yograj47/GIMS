import api from "@/lib/api";
import type { ApiResponse } from "@/types/api";
import type { SupplierFormData } from "@/types/supplier";

const baseUrl = "/suppliers"

export const SupplierService = {
    getAll: async (page?: number, limit?: number, search?: string, all?: boolean) => {
        const { data } = await api.get<ApiResponse>(baseUrl, {
            params: all
                ? { paginate: false, search }
                : { page, limit, search }
        });
        return data;
    },

    getById: async (id: string) => {
        const { data } = await api.get<ApiResponse>(`${baseUrl}/${id}`);
        return data;
    },

    create: async (payload: SupplierFormData) => {
        const { data } = await api.post<ApiResponse>(baseUrl, payload);
        return data;
    },

    updateById: async (id: string, payload: SupplierFormData) => {
        const { data } = await api.put<ApiResponse>(`${baseUrl}/${id}`, payload);
        return data;
    },

    delete: async (id: string) => {
        const { data } = await api.delete(`${baseUrl}/${id}`);
        return data;
    },

    assignProducts: async (supplierId: string, productIds: string[]) => {
        const { data } = await api.patch(`${baseUrl}/${supplierId}/assign-products`, {
            productIds,
        });
        return data;
    },

    unassignProduct: async (productId: string) => {
        const { data } = await api.patch(`${baseUrl}/unassign-product/${productId}`);
        return data;
    }
}

