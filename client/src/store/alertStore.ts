import type { AlertData } from "@/types/alert";
import { create } from "zustand";

interface AlertState {
    activeAlerts: AlertData[];
    alerts: AlertData[];
    setActiveAlerts: (data: AlertData[]) => void;
    setAlerts: (data: AlertData[]) => void;
    resolveAlertLocally: (id: string) => void;
}

export const useAlertStore = create<AlertState>((set) => ({
    activeAlerts: [],
    alerts: [],
    setActiveAlerts: (data) => set({ activeAlerts: data }),
    setAlerts: (data) => set({ alerts: data }),
    resolveAlertLocally: (id) => set((state) => ({
        alerts: state.alerts.map(a => a._id === id ? { ...a, resolved: true } : a),
        activeAlerts: state.activeAlerts.filter(a => a._id !== id)
    }))
}));