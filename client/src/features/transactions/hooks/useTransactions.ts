import { useState, useCallback } from "react";
import { useGlobalStore } from "@/store/globalStore";
import { transactionService } from "../api/TransactionService";
import type { TransactionData, TransactionFormData } from "@/types/Transaction";
import { notify } from "@/lib/toast";

export const useTransactions = () => {
    const [transactions, setTransactions] = useState<TransactionData[]>([]);
    const { isLoading, setLoading } = useGlobalStore();

    // 1. Fetch All Transactions
    const fetchTransactions = useCallback(async () => {
        try {
            setLoading(true);
            const response = await transactionService.getAll();
            if (response.status === "Success") {
                // Ensure we always have an array even if data is null
                setTransactions((response.data as TransactionData[]) || []);
            }
        } catch (error) {
            console.error("Fetch Transactions Error:", error);
        } finally {
            setLoading(false);
        }
    }, [setLoading]);

    // 2. Create Transaction
    const createStockTransaction = async (payload: TransactionFormData) => {
        try {
            setLoading(true);
            const response = await transactionService.create(payload);
            if (response.status === "Success") {
                notify.success("Transaction created successfully");

                // Immediately add the new populated transaction to the top of the list
                const newTransaction = response.data as TransactionData;
                setTransactions((prev) => [newTransaction, ...prev]);

                return true;
            }
        } catch (error) {
            console.error("Create Transaction Error:", error);
        } finally {
            setLoading(false);
        }
        return false;
    };

    // 3. Update Credit Status
    const updateCreditStatus = async (id: string, isPaid: boolean) => {
        try {
            setLoading(true);
            const response = await transactionService.updateCreditStatus(id, { isPaid });
            if (response.status === "Success") {
                notify.success("Status updated successfully");

                setTransactions((prev) =>
                    prev.map((t) => (t._id === id ? { ...t, isPaid } : t))
                );

                return true;
            }
        } catch (error) {
            console.error("Update Credit Status Error:", error);
        } finally {
            setLoading(false);
        }
        return false;
    };

    return {
        transactions,
        isLoading,
        fetchTransactions,
        createStockTransaction,
        updateCreditStatus
    };
};