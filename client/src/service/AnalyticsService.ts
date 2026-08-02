import api from "@/lib/api";
import type { AnalyticsAPIResponse } from "@/types/Analytics";

export const AnalyticsService = {
    getWeeklyMovements: async () => {
        const { data } = await api.get<AnalyticsAPIResponse>("/analytics/weekly-movements");
        return data;
    },

    getSummary: async () => {
        const { data } = await api.get("/analytics/summary");
        return data;
    }
}