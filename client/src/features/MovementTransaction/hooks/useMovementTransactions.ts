import { useState, useCallback } from "react";
import { useGlobalStore } from "@/store/globalStore";
import { MovementTransactionService } from "../../../service/MovementTransactionService";
import type { TransactionData, TransactionFormData } from "@/types/Transaction";
import type { MovementData } from "@/types/Movement";
import { notify } from "@/lib/toast";
import type { PaginationMetadata } from "@/types/Pagination";

export const useMovementTransactions = () => {
    const [transactions, setTransactions] = useState<TransactionData[]>([]);
    const [movements, setMovements] = useState<MovementData[]>([]);
    const [productMovements, setProductMovements] = useState<MovementData[]>([]);
    const [meta, setMeta] = useState<PaginationMetadata | null>(null);

    const { isLoading, setLoading } = useGlobalStore();

    // 1. Fetch All Transactions
    const fetchTransactions = useCallback(async (
        page?: number,
        limit?: number,
        search?: string,
        transactionType?: string,
        startDate?: string,
        endDate?: string,
        all?: boolean,
    ) => {
        try {
            setLoading(true);
            const response = await MovementTransactionService.getAllTransactions(page, limit, search, transactionType, startDate, endDate, all);
            if (response.status === "Success") {
                setTransactions((response.data as TransactionData[]) || []);
                setMeta(all ? null : (response.meta || null));
                return true;
            }
        } catch (error) {
            notify.error("Failed to load transactions");
        } finally {
            setLoading(false);
        }
    }, [setLoading]);

    // 2. Fetch All Physical Movements
    const fetchMovements = useCallback(async (page?: number, limit?: number, search?: string, movementType?: string, all?: boolean) => {
        try {
            setLoading(true);
            const response = await MovementTransactionService.getAllMovements(page, limit, search, movementType, all);
            if (response.status === "Success") {
                setMovements((response.data as MovementData[]) || []);
                setMeta(all ? null : (response.meta || null));
                return true;
            }
        } catch (error) {
            notify.error("Failed to load stock history");
        } finally {
            setLoading(false);
        }
    }, [setLoading]);

    // 3. Fetch Movements for a Specific Product (Audit Trail)
    const fetchProductMovements = useCallback(async (productId: string, page: number = 1,
        limit: number = 10, all?: boolean) => {
        try {
            setLoading(true);
            const response = await MovementTransactionService.getProductMovements(productId, page, limit, all);
            if (response.status === "Success") {
                setProductMovements((response.data as MovementData[]) || []);
                setMeta(all ? null : (response.meta || null));
                return true;

            }
        } catch (error) {
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
            notify.error("Transaction failed");
        } finally {
            setLoading(false);
        }
        return false;
    };

    // 5. Update Credit Status
    const updateCreditStatus = async (id: string, payload: { isPaid: boolean; notes?: string }) => {
        try {
            setLoading(true);
            const response = await MovementTransactionService.updateCreditStatus(id, payload);
            if (response.status === "Success") {
                notify.success("Payment status updated");
                setTransactions((prev) =>
                    prev.map((t) => (t._id === id ? { ...t, ...payload } : t))
                );
                return true;
            }
        } catch (error) {
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
        meta,
        isLoading,
        fetchTransactions,
        fetchMovements,
        fetchProductMovements,
        createTransaction,
        updateCreditStatus
    };
};