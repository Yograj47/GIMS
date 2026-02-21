import { useState, useCallback } from 'react';
import { useGlobalStore } from '@/store/globalStore';
import { notify } from '@/lib/toast';
import { productUnitService } from '../api/ProductUnitService';
import type { 
    GroupedProductUnit, 
    ProductUnitFormData, 
} from '@/types/ProductUnit';

export const useProductUnits = () => {
    const [groupedUnits, setGroupedUnits] = useState<GroupedProductUnit[]>([]);
    const { setLoading, isLoading } = useGlobalStore();

    // 1. Fetch Grouped Product Units (Aggregation)
    const fetchGroupedUnits = useCallback(async () => {
        try {
            setLoading(true);
            const response = await productUnitService.getGroupedUnits();
            if (response.status === "Success") {
                setGroupedUnits(response.data as GroupedProductUnit[]);
            }
        } catch (error: any) {
            // Error handled by global interceptor/store
        } finally {
            setLoading(false);
        }
    }, [setLoading]);

    // 2. Create Product Unit Conversion
    const addProductUnit = async (payload: ProductUnitFormData) => {
        try {
            setLoading(true);
            const response = await productUnitService.create(payload);
            if (response.status === "Success") {
                // Since data is grouped, it's safer to re-fetch to ensure correct UI grouping
                await fetchGroupedUnits();
                notify.success("Unit conversion added");
                return true;
            }
        } finally {
            setLoading(false);
        }
        return false;
    };

    // 3. Update Product Unit (Multiplier, Default, etc.)
    const updateProductUnit = async (id: string, payload: Partial<ProductUnitFormData>) => {
        try {
            setLoading(true);
            const response = await productUnitService.update(id, payload);
            if (response.status === "Success") {
                // Re-fetching ensures that 'isDefault' flags are synced across all units
                await fetchGroupedUnits();
                notify.success("Conversion updated");
                return true;
            }
        } finally {
            setLoading(false);
        }
        return false;
    };

    // 4. Remove Product Unit
    const removeProductUnit = async (id: string, productId: string) => {
        try {
            setLoading(true);
            const response = await productUnitService.delete(id);
            if (response.status === "Success") {
                // Optimistic UI Update: Filter nested conversions without full re-fetch
                setGroupedUnits((prev) => 
                    prev.map((group) => {
                        if (group._id === productId) {
                            return {
                                ...group,
                                conversions: group.conversions.filter((c) => c._id !== id)
                            };
                        }
                        return group;
                    })
                );
                notify.success("Unit removed");
            }
        } finally {
            setLoading(false);
        }
    };

    return {
        groupedUnits,
        isLoading,
        fetchGroupedUnits,
        addProductUnit,
        updateProductUnit,
        removeProductUnit
    };
};