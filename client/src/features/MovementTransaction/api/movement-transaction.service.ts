import api from "@/lib/api";
import type {
    CreditTransactionInput,
    TransactionFormData,
} from "@/types/transaction";
import type { ApiResponse } from "@/types/api";

export const MovementTransactionService = {
    getAllTransactions: async (page: number = 1, limit: number = 10, search?: string, transactionType?: string, startDate?: string,
        endDate?: string, all?: boolean): Promise<ApiResponse> => {
        const typeFilter = transactionType === "All Types" ? "" : transactionType;
        const { data } = await api.get<ApiResponse>("/transactions", {
            params: all
                ? { paginate: false, search, transactionType: typeFilter, startDate, endDate }
                : { page, limit, search, transactionType: typeFilter, startDate, endDate }
        });
        return data;
    },

    createTransaction: async (payload: TransactionFormData): Promise<ApiResponse> => {
        const { data } = await api.post<ApiResponse>('/transactions', payload);
        return data;
    },

    updateCreditStatus: async (id: string, payload: CreditTransactionInput): Promise<ApiResponse> => {
        const { data } = await api.put<ApiResponse>(`/transactions/${id}/credit`, payload);
        return data;
    },

    getAllMovements: async (page: number = 1, limit: number = 10, search?: string, movementType?: string, all?: boolean): Promise<ApiResponse> => {
        const { data } = await api.get<ApiResponse>("/movements", {
            params: all
                ? { paginate: false, search, movementType }
                : { page, limit, search, movementType }
        });
        return data;
    },

    getProductMovements: async (productId: string, page: number = 1,
        limit: number = 10, all?: boolean): Promise<ApiResponse> => {
        const { data } = await api.get<ApiResponse>(`/movements/product-history/${productId}`, {
            params: all
                ? { paginate: false, productId }
                : { productId, page, limit }
        });
        return data;
    }
};