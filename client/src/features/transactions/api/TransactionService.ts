import api from "@/lib/api";
import type { 
  CreditTransactionInput, 
  TransactionAPIResponse, 
  TransactionFormData,
} from "@/types/Transaction";

export const transactionService = {
    /**
     * Fetches all transactions (Populated on backend)
     */
    getAll: async (): Promise<TransactionAPIResponse> => {
        const { data } = await api.get<TransactionAPIResponse>("/transactions");
        return data;
    },

    /**
     * Creates a new transaction
     * Returns the newly created, populated transaction and also create stock movements on the backend
     */
    create: async (payload: TransactionFormData): Promise<TransactionAPIResponse> => {
        const { data } = await api.post<TransactionAPIResponse>('/transactions', payload);
        return data;
    },

    /**
     * Updates the payment status (Credit/Paid)
     */
    updateCreditStatus: async (id: string, payload: CreditTransactionInput): Promise<TransactionAPIResponse> => {
        const { data } = await api.put<TransactionAPIResponse>(`/transactions/${id}/credit`, payload);
        return data;
    }
};