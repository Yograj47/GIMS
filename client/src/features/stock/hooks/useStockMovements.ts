import { useState } from "react";
import { stockMovementService } from "../api/StockMovementService";
import type { StockMovementData, } from "@/types/Stock";
import { useGlobalStore } from "@/store/globalStore";

export const useStockMovements = () => {
    const [stockMovements, setStockMovements] = useState<StockMovementData[]>([]);
    const { setLoading, isLoading } = useGlobalStore();

    const fetchStockMovements = async () => {
        try {
            setLoading(true);
            const response = await stockMovementService.getAll();
            if (response.status === "Success") {
                setStockMovements((response.data as StockMovementData[]) || []);
            }
        } finally {
            setLoading(false);
        }
    };

    return {
        stockMovements,
        fetchStockMovements,
        isLoading   
    };
};