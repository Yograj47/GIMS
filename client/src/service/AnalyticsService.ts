import api from "@/lib/api";
import type { AnalyticsAPIResponse } from "@/types/analytics";

const baseURL = "/analytics";

export const AnalyticsService = {
    getWeeklyMovements: async () => {
        const { data } = await api.get<AnalyticsAPIResponse>(`${baseURL}/weekly-movements`);
        return data;
    },

    getSummary: async () => {
        const { data } = await api.get(`${baseURL}/summary`);
        return data;
    }
}