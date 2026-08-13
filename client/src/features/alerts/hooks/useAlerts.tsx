import { useCallback } from "react";

import { notify } from "@/lib/toast";

import { AlertService }
    from "../api/alert.service";

import { useAlertStore }
    from "../store/alert.store";

import type {
    AlertData,
} from "@/types/alert";

import type {
    PaginationMetadata,
} from "@/types/pagination";

import { useState } from "react";

export const useAlerts = () => {
    const alerts =
        useAlertStore(
            (s) => s.alerts
        );

    const setAlerts =
        useAlertStore(
            (s) => s.setAlerts
        );

    const updateAlert =
        useAlertStore(
            (s) => s.updateAlert
        );

    const [meta, setMeta] =
        useState<PaginationMetadata | null>(
            null
        );

    const [isLoading, setLoading] =
        useState(false);

    const fetchAllAlerts =
        useCallback(
            async (
                page?: number,
                limit?: number,
                all?: boolean
            ) => {
                try {
                    setLoading(true);

                    const response =
                        await AlertService.getAllAlerts(
                            page,
                            limit,
                            all
                        );

                    if (
                        response.success
                    ) {
                        setAlerts(
                            response.data as AlertData[]
                        );

                        setMeta(
                            all
                                ? null
                                : response.meta ||
                                null
                        );

                        return true;
                    }
                } finally {
                    setLoading(false);
                }

                return false;
            },
            [setAlerts]
        );

    const acknowledgeAlert =
        async (id: string) => {
            try {
                setLoading(true);

                const response =
                    await AlertService.acknowledgeAlert(
                        id
                    );

                if (
                    response.success
                ) {
                    updateAlert(
                        response.data as AlertData
                    );

                    notify.success(
                        "Alert acknowledged"
                    );

                    return true;
                }
            } finally {
                setLoading(false);
            }

            return false;
        };

    return {
        alerts,

        activeAlerts:
            alerts.filter(
                (alert) =>
                    !alert.resolved
            ),

        activeCount:
            alerts.filter(
                (alert) =>
                    !alert.acknowledged &&
                    !alert.resolved
            ).length,

        fetchAllAlerts,
        acknowledgeAlert,

        isLoading,
        meta,
    };
};