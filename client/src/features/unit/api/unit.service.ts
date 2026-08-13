import api from "@/lib/api";
import type { ApiResponse } from "@/types/api";
import type { UnitFormData } from "@/types/unit";

const baseUrl = "/units"

export const unitService = {
    getAll: async (page: number = 1, limit: number = 10, search?: string, all?: boolean) => {
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

    create: async (payload: UnitFormData) => {
        const { data } = await api.post<ApiResponse>(baseUrl, payload);
        return data;
    },

    updateById: async (id: string, payload: UnitFormData) => {
        const { data } = await api.put<ApiResponse>(`${baseUrl}/${id}`, payload);
        return data;
    },

    delete: async (id: string) => {
        const { data } = await api.delete(`${baseUrl}/${id}`);
        return data;
    }
};