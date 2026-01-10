import { create } from "zustand"

type stateType = {
    backendUrl: string
}

export const useGlobalStore = create<stateType>((set) =>
({
    backendUrl: import.meta.env.VITE_BACKEND_URL
}))