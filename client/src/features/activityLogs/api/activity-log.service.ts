import api from "@/lib/api";
import type { ApiResponse } from "@/types/api";

const baseUrl = "/activity-logs"
export const ActivityLogService = {
    getAll: async (page?: number, limit?: number, type?: string, search?: string) => {
        const { data } = await api.get<ApiResponse>(baseUrl, {
            params: {
                page,
                limit,
                type,
                search,
                paginate: limit !== undefined
            }
        });
        return data;
    },

    getRecent: async (limit: number = 5) => {
        const { data } = await api.get<ApiResponse>(baseUrl, {
            params: { limit, paginate: true }
        });
        return data;
    }
};