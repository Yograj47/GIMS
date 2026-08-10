import api from "@/lib/api";
import type { GeneralSettingsAPIResponse, GeneralSettingsFormData } from "@/types/Setting";

export const SettingsService = {

    getGeneral: async () => {
        const { data } = await api.get<GeneralSettingsAPIResponse>("/settings/");
        return data;
    },

    updateGeneral: async (payload: GeneralSettingsFormData) => {
        const { data } = await api.put<GeneralSettingsAPIResponse>("/settings/", payload);
        return data;
    }
};