import { useEffect } from "react";

import { socket } from "../socket";
import { SOCKET_EVENTS } from "../socket.event";

import { useAlertStore } from "@/features/alerts/store/alert.store";
import type { AlertData } from "@/types/alert";

type AlertResolvedPayload = {
    alertId: string;
};

export const useAlertSocket = () => {
    const addAlert =
        useAlertStore(
            (s) => s.addAlert
        );

    const updateAlert =
        useAlertStore(
            (s) => s.updateAlert
        );

    const removeAlert =
        useAlertStore(
            (s) => s.removeAlert
        );

    useEffect(() => {
        const handleAlertCreated = (
            alert: AlertData
        ) => {
            addAlert(alert);
        };

        const handleAlertUpdated = (
            alert: AlertData
        ) => {
            updateAlert(alert);
        };

        const handleAlertAcknowledged = (
            alert: AlertData
        ) => {
            updateAlert(alert);
        };

        const handleAlertResolved = (
            payload: AlertResolvedPayload
        ) => {
            removeAlert(
                payload.alertId
            );
        };

        socket.on(
            SOCKET_EVENTS.ALERT_CREATED,
            handleAlertCreated
        );

        socket.on(
            SOCKET_EVENTS.ALERT_UPDATED,
            handleAlertUpdated
        );

        socket.on(
            SOCKET_EVENTS.ALERT_ACKNOWLEDGED,
            handleAlertAcknowledged
        );

        socket.on(
            SOCKET_EVENTS.ALERT_RESOLVED,
            handleAlertResolved
        );

        return () => {
            socket.off(
                SOCKET_EVENTS.ALERT_CREATED,
                handleAlertCreated
            );

            socket.off(
                SOCKET_EVENTS.ALERT_UPDATED,
                handleAlertUpdated
            );

            socket.off(
                SOCKET_EVENTS.ALERT_ACKNOWLEDGED,
                handleAlertAcknowledged
            );

            socket.off(
                SOCKET_EVENTS.ALERT_RESOLVED,
                handleAlertResolved
            );
        };
    }, [
        addAlert,
        updateAlert,
        removeAlert,
    ]);
};