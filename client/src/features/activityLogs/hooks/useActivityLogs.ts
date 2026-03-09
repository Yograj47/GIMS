import { useState, useCallback } from 'react';
import { useGlobalStore } from '@/store/globalStore';
import { ActivityLogService } from '../api/ActivityLogService';
import type { ActivityAPIResponse, ActivityLogData } from '@/types/ActivityLog';
import type { PaginationMetadata } from '@/types/Unit';
import api from '@/lib/api';

export const useActivityLogs = () => {
    const [logs, setLogs] = useState<ActivityLogData[]>([]);
    const [meta, setMeta] = useState<PaginationMetadata | null>(null);
    const { setLoading, isLoading } = useGlobalStore();

    // 1. Fetch Logs (Supports Dashboard live feed and full Audit page)
    const fetchLogs = useCallback(async (
        page?: number,
        limit?: number,
        type?: string,
        search?: string,
        startDate?: string, // YYYY-MM-DD
        endDate?: string    // YYYY-MM-DD
    ) => {
        try {
            setLoading(true);
            const { data } = await api.get<ActivityAPIResponse>("/activity-logs", {
                params: {
                    page, limit, type, search, startDate, endDate, paginate: true
                }
            });

            if (data.status === "Success") {
                setLogs(data.data);
                setMeta(data.meta || null);
            }
        } catch (error) {
            console.error("Filter Error:", error);
        } finally {
            setLoading(false);
        }
    }, [setLoading]);

    // 2. Specialized Fetch for Dashboard (Recent 5)
    const fetchRecentLogs = useCallback(async (limit: number = 5) => {
        try {
            // We usually don't want a full-screen loader for a side-panel refresh
            const response = await ActivityLogService.getRecent(limit);
            if (response.status === "Success") {
                setLogs(response.data);
                return true;
            }
        } finally {
            // No-op
        }
        return false;
    }, []);

    return {
        logs,
        meta,
        isLoading,
        fetchLogs,
        fetchRecentLogs
    };
};