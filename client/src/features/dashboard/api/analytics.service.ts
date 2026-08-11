import api from "@/lib/api";
import type { ApiResponse } from "@/types/api";

const baseURL = "/analytics";

export const AnalyticsService = {
    getWeeklyMovements: async () => {
        const { data } = await api.get<ApiResponse>(`${baseURL}/weekly-movements`);
        return data;
    },

    getSummary: async () => {
        const { data } = await api.get(`${baseURL}/summary`);
        return data;
    }
}