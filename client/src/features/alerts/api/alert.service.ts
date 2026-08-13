import api from "@/lib/api";
import type { ApiResponse } from "@/types/api";

const baseUrl = "/alerts";

export const AlertService = {
    getAllAlerts: async (
        page: number = 1,
        limit: number = 10,
        all?: boolean
    ): Promise<ApiResponse> => {
        const { data } = await api.get<ApiResponse>(baseUrl, {
            params: all
                ? { paginate: false }
                : { page, limit }
        });
        return data;
    },

    getActiveAlerts: async (): Promise<ApiResponse> => {
        const { data } = await api.get<ApiResponse>(`${baseUrl}/active`);
        return data;
    },

    acknowledgeAlert: async (id: string): Promise<ApiResponse> => {
        const { data } = await api.patch<ApiResponse>(
            `${baseUrl}/${id}/acknowledge`
        );
        return data;
    }
};