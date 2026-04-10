import { create } from "zustand";
import type { AlertData } from "@/types/Alert";
import type { GeneralSettingsData } from "@/types/Setting";
import { SettingsService } from "@/apis/SettingService";

interface GlobalState {
  isLoading: boolean;
  setLoading: (loading: boolean) => void;

  activeAlerts: AlertData[];
  alerts: AlertData[];

  setActiveAlerts: (data: AlertData[]) => void;
  setAlerts: (data: AlertData[]) => void;
  acknowledgeAlertLocally: (id: string) => void;

  settings: GeneralSettingsData | null;
  fetchSettings: () => Promise<void>;
}

export const useGlobalStore = create<GlobalState>((set) => ({
  isLoading: false,
  activeAlerts: [],
  alerts: [],

  settings: null,

  fetchSettings: async () => {
    try {
      const response = await SettingsService.getGeneral();
      if (response.status === "Success") {
        set({ settings: response.data });
      }
    } catch (error) {
      console.error("Failed to sync system settings:", error);
    }
  },

  setLoading: (loading) => set(() => ({ isLoading: loading })),

  setActiveAlerts: (data) => set({ activeAlerts: data }),

  setAlerts: (data) => set({ alerts: data }),

  acknowledgeAlertLocally: (id) => set((state) => ({
    alerts: state.alerts.map((a) =>
      a._id === id
        ? { ...a, acknowledged: true, acknowledgedAt: new Date().toISOString() }
        : a
    ),
    activeAlerts: state.activeAlerts.map((a) =>  
      a._id === id
        ? { ...a, acknowledged: true, acknowledgedAt: new Date().toISOString() }
        : a
    ),
  })),
}));