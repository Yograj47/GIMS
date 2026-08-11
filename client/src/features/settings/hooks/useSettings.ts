import { useState, useCallback } from 'react';
import { notify } from '@/lib/toast';
import type { GeneralSettingsData, GeneralSettingsFormData } from '@/types/setting';
import { SettingsService } from '../api/setting.service';

export const useSettings = () => {
    const [generalData, setGeneralData] = useState<GeneralSettingsData | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const fetchGeneral = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await SettingsService.getGeneral();
            if (response.success) {
                setGeneralData(response.data as GeneralSettingsData);
            }
        } catch (error: any) {
        } finally {
            setIsLoading(false);
        }
    }, []);

    // 2. Update Settings
    const updateGeneral = async (payload: GeneralSettingsFormData) => {
        try {
            setIsLoading(true);
            const response = await SettingsService.updateGeneral(payload);

            if (response.success) {
                setGeneralData(response.data as GeneralSettingsData);
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