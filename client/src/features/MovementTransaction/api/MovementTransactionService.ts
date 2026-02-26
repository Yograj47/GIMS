import api from "@/lib/api";
import type {
    CreditTransactionInput,
    TransactionAPIResponse,
    TransactionFormData,
} from "@/types/Transaction";
import type { MovementAPIResponse } from "@/types/Movement";

/**
 * Unified Service for handling Sales, Purchases, and physical Inventory Movements
 */
export const MovementTransactionService = {
    // --- TRANSACTION SECTION (Money & Invoices) ---

    /**
     * Fetches all transactions (Sales, Purchases, Returns)
     */
    getAllTransactions: async (page: number = 1, limit: number = 10, search?: string, transactionType?: string, startDate?: string,
        endDate?: string, all?: boolean): Promise<TransactionAPIResponse> => {
        const typeFilter = transactionType === "All Types" ? "" : transactionType;
        const { data } = await api.get<TransactionAPIResponse>("/transactions", {
            params: all
                ? { paginate: false, search, transactionType: typeFilter, startDate, endDate }
                : { page, limit, search, transactionType: typeFilter, startDate, endDate }
        });
        return data;
    },

    /**
     * Creates a new transaction (This also triggers physical Movements on the backend)
     */
    createTransaction: async (payload: TransactionFormData): Promise<TransactionAPIResponse> => {
        const { data } = await api.post<TransactionAPIResponse>('/transactions', payload);
        return data;
    },

    /**
     * Updates the payment status of a credit transaction
     */
    updateCreditStatus: async (id: string, payload: CreditTransactionInput): Promise<TransactionAPIResponse> => {
        const { data } = await api.put<TransactionAPIResponse>(`/transactions/${id}/credit`, payload);
        return data;
    },

    // --- MOVEMENT SECTION (Physical Stock Tracking) ---

    /**
     * Fetches the history of all physical stock movements (IN/OUT)
     */
    getAllMovements: async (page: number = 1, limit: number = 10, search?: string, movementType?: string, all?: boolean): Promise<MovementAPIResponse> => {
        const { data } = await api.get<MovementAPIResponse>("/movements", {
            params: all
                ? { paginate: false, search, movementType }
                : { page, limit, search, movementType }
        });
        return data;
    },

    /**
     * Fetches movements for a specific product (Useful for product audit pages)
     */
    getProductMovements: async (productId: string): Promise<MovementAPIResponse> => {
        const { data } = await api.get<MovementAPIResponse>(`/movements/product-history/${productId}`);
        return data;
    }
};