import api from "@/lib/api";
import type { StockMovementAPIResponse, } from "@/types/Stock";

export const stockMovementService = {
    getAll: async () => {
        const { data } = await api.get<StockMovementAPIResponse>("/transactions/movements");
        return data;
    },
};