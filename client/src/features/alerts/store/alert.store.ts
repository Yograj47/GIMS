import { create } from "zustand";

import type { AlertData } from "@/types/alert";

interface AlertState {
    alerts: AlertData[];

    setAlerts: (
        alerts: AlertData[]
    ) => void;

    addAlert: (
        alert: AlertData
    ) => void;

    updateAlert: (
        alert: AlertData
    ) => void;

    removeAlert: (
        alertId: string
    ) => void;

    clearAlerts: () => void;
}

export const useAlertStore =
    create<AlertState>((set) => ({
        alerts: [],

        setAlerts: (alerts) =>
            set({ alerts }),

        addAlert: (alert) =>
            set((state) => ({
                alerts: [
                    alert,
                    ...state.alerts.filter(
                        (item) =>
                            item._id !==
                            alert._id
                    ),
                ],
            })),

        updateAlert: (alert) =>
            set((state) => ({
                alerts:
                    state.alerts.map(
                        (item) =>
                            item._id ===
                                alert._id
                                ? alert
                                : item
                    ),
            })),

        removeAlert: (
            alertId
        ) =>
            set((state) => ({
                alerts:
                    state.alerts.filter(
                        (item) =>
                            item._id !==
                            alertId
                    ),
            })),

        clearAlerts: () =>
            set({
                alerts: [],
            }),
    }));