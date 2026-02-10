import api from "@/lib/api";
import type { UnitAPIResponse, UnitFormData } from "@/types/Unit";

export const unitService = {
    getAll: async () => {
        const { data } = await api.get<UnitAPIResponse>("/units");
        return data;
    },

    getById: async (id: string) => {
        const { data } = await api.get<UnitAPIResponse>(`/units/${id}`);
        return data;
    },

    create: async (payload: UnitFormData) => {
        const { data } = await api.post<UnitAPIResponse>('/units', payload);
        return data;
    },

    updateById: async (id: string, payload: UnitFormData) => {
        const { data } = await api.put<UnitAPIResponse>(`/units/${id}`, payload);
        return data;
    },

    delete: async (id: string) => {
        const { data } = await api.delete(`/units/${id}`);
        return data;
    }
};