import { useState, useCallback } from 'react';
import { useGlobalStore } from '@/store/globalStore';
import { notify } from '@/lib/toast';
import { AlertService } from '../api/AlertService';
import type { AlertData, PaginationMetadata } from '@/types/Alert';

export const useAlerts = () => {
    const [alerts, setAlerts] = useState<AlertData[] >([]);
    const [activeAlerts, setActiveAlerts] = useState<AlertData[]>([]);
    const [meta, setMeta] = useState<PaginationMetadata | null>(null);
    const { setLoading, isLoading } = useGlobalStore();

    // 1. Fetch All Alerts (Paginated - for Alerts Page)
    const fetchAllAlerts = useCallback(async (page?: number, limit?: number, all?: boolean) => {
        try {
            setLoading(true);
            const response = await AlertService.getAllAlerts(page, limit, all);
            if (response.status === "Success") {
                setAlerts(response.data);
                setMeta(all ? null : (response.meta || null));
                return true;
            }
        } catch (error) {
            // Error handled by global interceptor
        } finally {
            setLoading(false);
        }
    }, [setLoading]);

    // 2. Fetch Active Alerts (Non-paginated - for Dashboard/Sidebar)
    const fetchActiveAlerts = useCallback(async () => {
        try {
            // We usually don't want the big global loading spinner for background/badge updates
            const response = await AlertService.getActiveAlerts();
            if (response.status === "Success") {
                setActiveAlerts(response.data as AlertData[]);
                return response.data;
            }
        } finally {
            // Silent catch
        }
    }, []);

    // 3. Resolve Alert
    const markAsResolved = async (id: string) => {
        try {
            setLoading(true);
            const response = await AlertService.resolveAlert(id);
            if (response.status === "Success") {
                // Update local state to reflect resolution
                setAlerts((prev) => prev.map(a => a._id === id ? { ...a, resolved: true } : a));
                setActiveAlerts((prev) => prev.filter(a => a._id !== id));
                notify.success("Alert marked as resolved");
                return true;
            }
        } finally {
            setLoading(false);
        }
        return false;
    };

    return {
        alerts,
        activeAlerts,
        activeCount: activeAlerts.length,
        isLoading,
        fetchAllAlerts,
        fetchActiveAlerts,
        markAsResolved,
        meta
    };
};