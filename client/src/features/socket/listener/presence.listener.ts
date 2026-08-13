import { useEffect } from "react";

import { socket } from "../socket";
import { SOCKET_EVENTS } from "../socket.event";

import { usePresenceStore } from "../store/presence.store";

export const usePresenceSocket =
    () => {
        const addOnlineUser =
            usePresenceStore(
                (s) => s.addOnlineUser
            );

        const removeOnlineUser =
            usePresenceStore(
                (s) => s.removeOnlineUser
            );

        useEffect(() => {
            const handleOnline = ({
                userId,
            }: {
                userId: string;
            }) => {
                addOnlineUser(userId);
            };

            const handleOffline = ({
                userId,
            }: {
                userId: string;
            }) => {
                removeOnlineUser(userId);
            };

            socket.on(
                SOCKET_EVENTS.USER_ONLINE,
                handleOnline
            );

            socket.on(
                SOCKET_EVENTS.USER_OFFLINE,
                handleOffline
            );

            return () => {
                socket.off(
                    SOCKET_EVENTS.USER_ONLINE,
                    handleOnline
                );

                socket.off(
                    SOCKET_EVENTS.USER_OFFLINE,
                    handleOffline
                );
            };
        }, [
            addOnlineUser,
            removeOnlineUser,
        ]);
    };