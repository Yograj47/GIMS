import { useState, useCallback } from 'react';
import { useGlobalStore } from '@/store/globalStore';
import { ActivityLogService } from '../../../apis/ActivityLogService';
import type { ActivityAPIResponse, ActivityLogData } from '@/types/ActivityLog';
import api from '@/lib/api';
import type { pagination, PaginationMetadata } from '@/types/Pagination';

export const useActivityLogs = () => {
    const [logs, setLogs] = useState<ActivityLogData[]>([]);
    const [meta, setMeta] = useState<PaginationMetadata | null>(null);
    const { setLoading, isLoading } = useGlobalStore();

    // 1. Fetch Logs (Supports Dashboard live feed and full Audit page)
    const fetchLogs = useCallback(async (
        { page, limit, type, search, startDate, endDate }: pagination) => {
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
            const response = await ActivityLogService.getRecent(limit);
            if (response.status === "Success") {
                setLogs(response.data);
                return true;
            }
        } finally {
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