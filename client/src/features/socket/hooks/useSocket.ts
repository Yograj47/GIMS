import { useContext } from "react";
import { createContext } from "react";
import { socket } from "../socket";

const SocketContext = createContext(socket);

export const useSocketContext = () => useContext(SocketContext);