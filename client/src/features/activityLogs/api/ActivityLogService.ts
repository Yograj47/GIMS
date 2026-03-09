import api from "@/lib/api";
import type { ActivityAPIResponse } from "@/types/ActivityLog";

export const ActivityLogService = {
    /**
     * Get activity logs with flexible filters
     * @param page - Current page number
     * @param limit - Number of items per page
     * @param type - Filter by module (AUTH, INVENTORY, etc.)
     * @param search - Search in message or action
     */
    getAll: async (page?: number, limit?: number, type?: string, search?: string) => {
        const { data } = await api.get<ActivityAPIResponse>("/activity-logs", {
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

    /**
     * Specialized fetch for Dashboard Live Feed
     * Fetches the most recent 5-10 logs without full search overhead
     */
    getRecent: async (limit: number = 5) => {
        const { data } = await api.get<ActivityAPIResponse>("/activity-logs", {
            params: { limit, paginate: true }
        });
        return data;
    }
};