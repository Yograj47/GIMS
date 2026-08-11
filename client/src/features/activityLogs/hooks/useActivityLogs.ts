import { useState, useCallback } from 'react';
import { ActivityLogService } from '../api/activity-log.service';
import type { ActivityLogData } from '@/types/activity-log';
import api from '@/lib/api';
import type { PaginationMetadata } from '@/types/pagination';
import type { ApiResponse } from '@/types/api';

export const useActivityLogs = () => {
    const [logs, setLogs] = useState<ActivityLogData[]>([]);
    const [meta, setMeta] = useState<PaginationMetadata | null>(null);
    const [isLoading, setLoading] = useState(false);

    const fetchLogs = useCallback(async (
        page?: number, limit?: number, type?: string, search?: string, startDate?: string, endDate?: string) => {
        try {
            setLoading(true);
            const { data } = await api.get<ApiResponse>("/activity-logs", {
                params: {
                    page, limit, type, search, startDate, endDate, paginate: true
                }
            });

            if (data.success) {
                setLogs(data.data as ActivityLogData[]);
                setMeta(data.meta ? (data.meta as PaginationMetadata) : null);
            }
        } catch (error) {
        } finally {
            setLoading(false);
        }
    }, [setLoading]);

    const fetchRecentLogs = useCallback(async (limit: number = 5) => {
        try {
            const response = await ActivityLogService.getRecent(limit);
            if (response.success) {
                setLogs(response.data as ActivityLogData[]);
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