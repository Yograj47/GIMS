import api from "@/lib/api";
import type { AlertAPIResponse, AlertData } from "@/types/Alert";

export const AlertService = {
    /**
     * Fetches all alerts with standard pagination and search
     */
    getAllAlerts: async (
        page: number = 1,
        limit: number = 10,
        all?: boolean
    ): Promise<AlertAPIResponse> => {
        const { data } = await api.get<AlertAPIResponse>("/alerts", {
            params: all
                ? { paginate: false }
                : { page, limit }
        });
        return data;
    },

    /**
     * Fetches active (unresolved) alerts only
     * Used for the Dashboard widgets and Sidebar notification badges
     */
    getActiveAlerts: async (): Promise<AlertAPIResponse> => {
        const { data } = await api.get<AlertAPIResponse>("/alerts/active");
        return data;
    },

    /**
     * Marks an alert as acknowledge not resolved
     * Usually triggered manually if the user acknowledges the alert
     */
    acknowledgeAlert: async (id: string): Promise<{ status: string; data: AlertData }> => {
    const { data } = await api.patch<{ status: string; data: AlertData }>(
        `/alerts/${id}/acknowledge`
    );
    return data;
}
};