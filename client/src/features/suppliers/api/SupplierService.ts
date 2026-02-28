import api from "@/lib/api";
import type { SupplierAPIResponse, SupplierFormData } from "@/types/Supplier";

export const SupplierService = {
    getAll: async (page?: number, limit?: number, search?: string, all?: boolean) => {
        const { data } = await api.get<SupplierAPIResponse>("/Suppliers", {
            params: all
                ? { paginate: false, search }
                : { page, limit, search }
        });
        return data;
    },

    getById: async (id: string) => {
        const { data } = await api.get<SupplierAPIResponse>(`/Suppliers/${id}`);
        return data;
    },

    create: async (payload: SupplierFormData) => {
        const { data } = await api.post<SupplierAPIResponse>('/Suppliers', payload);
        return data;
    },

    updateById: async (id: string, payload: SupplierFormData) => {
        const { data } = await api.put<SupplierAPIResponse>(`/Suppliers/${id}`, payload);
        return data;
    },

    delete: async (id: string) => {
        const { data } = await api.delete(`/Suppliers/${id}`);
        return data;
    },

    assignProducts: async (supplierId: string, productIds: string[]) => {
        const { data } = await api.patch(`/Suppliers/${supplierId}/assign-products`, {
            productIds,
        });
        return data;
    },

    unassignProduct: async (productId: string) => {
        const { data } = await api.patch(`/Suppliers/unassign-product/${productId}`);
        return data;
    }
}

