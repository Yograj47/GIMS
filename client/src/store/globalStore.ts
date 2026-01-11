import { create } from "zustand";

type stateType = {
  backendUrl: string;
  isLoading: boolean;
  setLoading: (isLoading: boolean) => void;
};

export const useGlobalStore = create<stateType>((set) => ({
  backendUrl: import.meta.env.VITE_BACKEND_URL,
  isLoading: false,

  // Actions
  setLoading: (loading) => set({ isLoading: loading }),
}));