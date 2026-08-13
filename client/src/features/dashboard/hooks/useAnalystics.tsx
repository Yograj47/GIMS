import { useState, useCallback } from 'react';
import type { WeeklyMovementData } from '@/types/analytics';
import { AnalyticsService } from '../api/analytics.service';

export const useAnalytics = () => {
    const [weeklyStats, setWeeklyStats] = useState<WeeklyMovementData[]>([]);
    const [summary, setSummary] = useState({
        stockValue: 0,
        lowItems: 0,
        todayFlow: { value: 0, trend: "0", status: "UP" }
    });
    const [isLoading, setLoading] = useState(false);

    const fetchWeeklyStats = useCallback(async () => {
        try {
            setLoading(true);
            const response = await AnalyticsService.getWeeklyMovements();
            if (response.success) {
                setWeeklyStats(response.data as WeeklyMovementData[]);
                return response.data;
            }
        } finally {
            setLoading(false);
        }
    }, [setLoading]);

    const fetchSummary = useCallback(async () => {
        try {
            setLoading(true)
            const response = await AnalyticsService.getSummary();
            if (response.success) {
                setSummary(response.data);
                return response.data;
            }
        } finally {
            setLoading(false);
        }
    }, [setLoading])

    return {
        weeklyStats,
        summary,
        isLoading,
        fetchWeeklyStats,
        fetchSummary,
    };
};