import {
    createContext,
    useContext,
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

export const useSocketContext = () => useContext(SocketContext);