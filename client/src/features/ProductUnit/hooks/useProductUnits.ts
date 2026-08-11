import { useState, useCallback } from 'react';
import { notify } from '@/lib/toast';
import type {
    GroupedProductUnit,
    ProductUnitFormData,
} from '@/types/product-unit';
import type { PaginationMetadata } from '@/types/pagination';
import { productUnitService } from '@/features/ProductUnit/api/product-unit.service';

export const useProductUnits = () => {
    const [groupedUnits, setGroupedUnits] = useState<GroupedProductUnit[]>([]);
    const [isLoading, setLoading] = useState(false);
    const [meta, setMeta] = useState<PaginationMetadata | null>(null);


    const fetchGroupedUnits = useCallback(async (page?: number, limit?: number, search?: string, all?: boolean) => {
        try {
            setLoading(true);
            const response = await productUnitService.getGroupedUnits(page, limit, search, all);
            if (response.success) {
                setGroupedUnits(response.data as GroupedProductUnit[]);
                setMeta(all ? null : (response.meta || null));
            }
        } catch (error: any) {
        } finally {
            setLoading(false);
        }
    }, [setLoading]);

    const addProductUnit = async (payload: ProductUnitFormData) => {
        try {
            setLoading(true);
            const response = await productUnitService.create(payload);
            if (response.success) {
                await fetchGroupedUnits();
                notify.success("Unit conversion added");
                return true;
            }
        } finally {
            setLoading(false);
        }
        return false;
    };

    const updateProductUnit = async (id: string, payload: Partial<ProductUnitFormData>) => {
        try {
            setLoading(true);
            const response = await productUnitService.update(id, payload);
            if (response.success) {
                await fetchGroupedUnits();
                notify.success("Conversion updated");
                return true;
            }
        } finally {
            setLoading(false);
        }
        return false;
    };

    const removeProductUnit = async (id: string, productId: string) => {
        try {
            setLoading(true);
            const response = await productUnitService.delete(id);
            if (response.success) {
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
        removeProductUnit,
        meta
    };
};