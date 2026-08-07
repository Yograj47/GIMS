import {
    createContext,
    useContext,
    useEffect,
} from "react";

import { socket } from "./socket";

const SocketContext =
    createContext(socket);

export const SocketProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {

    useEffect(() => {
        socket.on(
            "connect",
            () => {
                console.log(
                    "Socket Connected:",
                    socket.id
                );
            }
        );

        socket.on(
            "disconnect",
            () => {
                console.log(
                    "Socket Disconnected"
                );
            }
        );

        return () => {
            socket.off("connect");
            socket.off("disconnect");
        };
    }, []);

    return (
        <SocketContext.Provider
            value={socket}
        >
            {children}
        </SocketContext.Provider>
    );
};

export const useSocketContext =
    () => useContext(
        SocketContext
    );