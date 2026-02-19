import { useState, useCallback } from "react";
import { useGlobalStore } from "@/store/globalStore";
import { MovementTransactionService } from "../api/MovementTransactionService";
import type { TransactionData, TransactionFormData } from "@/types/Transaction";
import type { MovementData } from "@/types/Movement";
import { notify } from "@/lib/toast";

export const useMovementTransactions = () => {
    const [transactions, setTransactions] = useState<TransactionData[]>([]);
    const [movements, setMovements] = useState<MovementData[]>([]);
    const [productMovements, setProductMovements] = useState<MovementData[]>([]);
    
    const { isLoading, setLoading } = useGlobalStore();

    // 1. Fetch All Transactions
    const fetchTransactions = useCallback(async () => {
        try {
            setLoading(true);
            const response = await MovementTransactionService.getAllTransactions();
            if (response.status === "Success") {
                setTransactions((response.data as TransactionData[]) || []);
            }
        } catch (error) {
            console.error("Fetch Transactions Error:", error);
            notify.error("Failed to load transactions");
        } finally {
            setLoading(false);
        }
    }, [setLoading]);

    // 2. Fetch All Physical Movements
    const fetchMovements = useCallback(async () => {
        try {
            setLoading(true);
            const response = await MovementTransactionService.getAllMovements();
            if (response.status === "Success") {
                setMovements((response.data as MovementData[]) || []);
            }
        } catch (error) {
            console.error("Fetch Movements Error:", error);
            notify.error("Failed to load stock history");
        } finally {
            setLoading(false);
        }
    }, [setLoading]);

    // 3. Fetch Movements for a Specific Product (Audit Trail)
    const fetchProductMovements = useCallback(async (productId: string) => {
        try {
            setLoading(true);
            const response = await MovementTransactionService.getProductMovements(productId);
            if (response.status === "Success") {
                setProductMovements((response.data as MovementData[]) || []);
            }
        } catch (error) {
            console.error("Fetch Product Movements Error:", error);
            notify.error("Failed to load product history");
        } finally {
            setLoading(false);
        }
    }, [setLoading]);

    // 4. Create Transaction
    const createTransaction = async (payload: TransactionFormData) => {
        try {
            setLoading(true);
            const response = await MovementTransactionService.createTransaction(payload);
            if (response.status === "Success") {
                notify.success("Transaction completed successfully");
                const newTransaction = response.data as TransactionData;
                setTransactions((prev) => [newTransaction, ...prev]);
                fetchMovements(); 
                return true;
            }
        } catch (error) {
            console.error("Create Transaction Error:", error);
            notify.error("Transaction failed");
        } finally {
            setLoading(false);
        }
        return false;
    };

    // 5. Update Credit Status
    const updateCreditStatus = async (id: string, isPaid: boolean) => {
        try {
            setLoading(true);
            const response = await MovementTransactionService.updateCreditStatus(id, { isPaid });
            if (response.status === "Success") {
                notify.success("Payment status updated");
                setTransactions((prev) =>
                    prev.map((t) => (t._id === id ? { ...t, isPaid } : t))
                );
                return true;
            }
        } catch (error) {
            console.error("Update Credit Status Error:", error);
            notify.error("Failed to update status");
        } finally {
            setLoading(false);
        }
        return false;
    };

    return {
        transactions,
        movements,
        productMovements, 
        isLoading,
        fetchTransactions,
        fetchMovements,
        fetchProductMovements, 
        createTransaction,
        updateCreditStatus
    };
};