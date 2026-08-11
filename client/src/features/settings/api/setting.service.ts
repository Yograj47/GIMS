import api from "@/lib/api";
import type { ApiResponse } from "@/types/api";
import type { GeneralSettingsFormData } from "@/types/setting";

export const SettingsService = {

    getGeneral: async () => {
        const { data } = await api.get<ApiResponse>("/settings/");
        return data;
    },

    updateGeneral: async (payload: GeneralSettingsFormData) => {
        const { data } = await api.put<ApiResponse>("/settings/", payload);
        return data;
    }
};