import { useEffect } from "react";
import { socket } from "@/features/socket/socket";

export type OrderUpdate = { orderId: string; status: string };

export function useOrderUpdates(onUpdate: (event: OrderUpdate) => void, onReconnect?: () => void, enabled = true) {
    useEffect(() => {
        if (!enabled) return;
        socket.on("order:updated", onUpdate);
        if (onReconnect) socket.on("connect", onReconnect);
        return () => {
            socket.off("order:updated", onUpdate);
            if (onReconnect) socket.off("connect", onReconnect);
        };
    }, [onUpdate, onReconnect, enabled]);
}
