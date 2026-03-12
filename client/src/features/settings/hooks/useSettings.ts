import { useState, useCallback } from 'react';
import { notify } from '@/lib/toast';
import type { GeneralSettingsData, GeneralSettingsFormData } from '@/types/Setting';
import { SettingsService } from '../../../apis/SettingService';

export const useSettings = () => {
    const [generalData, setGeneralData] = useState<GeneralSettingsData | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    // 1. Fetch Settings
    const fetchGeneral = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await SettingsService.getGeneral();
            if (response.status === "Success") {
                setGeneralData(response.data);
            }
        } catch (error: any) {
            console.error("Failed to fetch settings", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // 2. Update Settings
    const updateGeneral = async (payload: GeneralSettingsFormData) => {
        try {
            setIsLoading(true);
            const response = await SettingsService.updateGeneral(payload);

            if (response.status === "Success") {
                setGeneralData(response.data);
                notify.success("General settings updated successfully");
                return true;
            }
        } catch (error: any) {
            notify.error(error.response?.data?.message || "Failed to update settings");
        } finally {
            setIsLoading(false);
        }
        return false;
    };

    return {
        generalData,
        isLoading,
        fetchGeneral,
        updateGeneral
    };
};