import { useCallback, useState } from 'react';
import { useGlobalStore } from '@/store/globalStore';
import { notify } from '@/lib/toast';
import { AlertService } from '../api/alert.service';
import type { AlertData } from '@/types/alert';
import type { PaginationMetadata } from '@/types/pagination';

export const useAlerts = () => {
    const {
        activeAlerts,
        alerts,
        setActiveAlerts,
        setAlerts,
        acknowledgeAlertLocally,
        setLoading,
        isLoading
    } = useGlobalStore();

    const [meta, setMeta] = useState<PaginationMetadata | null>(null);


    const fetchAllAlerts = useCallback(async (page?: number, limit?: number, all?: boolean) => {

        try {
            setLoading(true);
            const response = await AlertService.getAllAlerts(page, limit, all);

            if (response.success) {
                setAlerts(response.data as AlertData[]);
                setMeta(all ? null : (response.meta || null));
                return true;
            }
        } catch (error) {
        } finally {
            setLoading(false);
        }
    }, [setLoading]);

    const fetchActiveAlerts = useCallback(async () => {
        try {
            const response = await AlertService.getActiveAlerts();
            if (response.success) {
                setActiveAlerts(response.data as AlertData[]);
                return response.data;
            }
        } finally { }
    }, [setActiveAlerts]);

    const acknowledgeAlert = async (id: string) => {
        try {
            setLoading(true);
            const response = await AlertService.acknowledgeAlert(id);
            if (response.success) {
                acknowledgeAlertLocally(id);
                notify.success("Alert acknowledged");
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
        activeCount: activeAlerts.filter(a => !a.acknowledged).length,
        fetchActiveAlerts,
        acknowledgeAlert,
        fetchAllAlerts,
        isLoading,
        meta
    };

};