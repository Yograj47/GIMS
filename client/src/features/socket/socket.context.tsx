import {
    createContext,
} from "react";

import { socket } from "./socket";
import { usePresenceSocket } from "./listener/presence.listener";
import { useAlertSocket } from "./listener/alert.listener";

const SocketContext = createContext(socket);

export const SocketProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    usePresenceSocket();
    useAlertSocket();
    return (
        <SocketContext.Provider
            value={socket}
        >
            {children}
        </SocketContext.Provider>
    );
};