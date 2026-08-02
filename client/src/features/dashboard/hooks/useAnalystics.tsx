import { useState, useCallback } from 'react';
import { useGlobalStore } from '@/store/globalStore';
import type { WeeklyMovementData } from '@/types/Analytics';
import { AnalyticsService } from '../../../service/AnalyticsService';

export const useAnalytics = () => {
    const [weeklyStats, setWeeklyStats] = useState<WeeklyMovementData[]>([]);
    const [summary, setSummary] = useState({
        stockValue: 0,
        lowItems: 0,
        todayFlow: { value: 0, trend: "0", status: "UP" }
    });
    const { setLoading, isLoading } = useGlobalStore();

    const fetchWeeklyStats = useCallback(async () => {
        try {
            setLoading(true);
            const response = await AnalyticsService.getWeeklyMovements();
            if (response.status === "Success") {
                setWeeklyStats(response.data);
                return response.data;
            }
        } catch (error) {
        } finally {
            setLoading(false);
        }
    }, [setLoading]);

    const fetchSummary = useCallback(async () => {
        try {
            setLoading(true)
            const response = await AnalyticsService.getSummary();
            if (response.status === "Success") {
                setSummary(response.data);
                return response.data;
            }
        } catch (error) {
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