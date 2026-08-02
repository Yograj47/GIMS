import { useState, useCallback } from 'react';
import { useGlobalStore } from '@/store/globalStore';
import { notify } from '@/lib/toast';
import type { UnitData, UnitFormData } from '@/types/Unit';
import { unitService } from '../../../service/UnitService';
import type { PaginationMetadata } from '@/types/Pagination';

export const useUnits = () => {
    const [units, setunits] = useState<UnitData[]>([]);
    const [meta, setMeta] = useState<PaginationMetadata | null>(null);
    const [singleUnit, setSingleUnit] = useState<UnitData | null>(null);
    const { setLoading, isLoading } = useGlobalStore();

    // 1. Fetch All units
    const fetchUnits = useCallback(async (page?: number, limit?: number, search?: string, all?: boolean) => {
        try {
            setLoading(true);
            const response = await unitService.getAll(page, limit, search, all);
            if (response.status === "Success") {
                setunits(response.data as UnitData[]);
                setMeta(all ? null : (response.meta || null));
                return true;
            }
        } catch (error: any) {
        } finally {
            setLoading(false);
        }
    }, [setLoading]);

    // 2. Fetch Single Unit (for Edit/View pages)
    const fetchUnitById = useCallback(async (id: string) => {
        try {
            setLoading(true);
            const response = await unitService.getById(id);
            if (response.status === "Success") {
                const data = response.data as UnitData;
                setSingleUnit(data);
                return data;
            }
        } finally {
            setLoading(false);
        }
    }, [setLoading]);

    // 3. Create Unit
    const addUnit = async (payload: UnitFormData) => {
        try {
            setLoading(true);
            const sanitizedPayload = {
                ...payload,
                multiplierToBase: payload.baseUnit ? 1 : payload.multiplierToBase
            };
            const response = await unitService.create(sanitizedPayload);
            if (response.status === "Success") {
                notify.success("Unit added successfully");
                setunits((prev) => [...prev, response.data as UnitData]);
                return true;
            }
        } finally {
            setLoading(false);
        }
        return false;
    };

    // 4. Update Unit
    const updateUnit = async (id: string, payload: UnitFormData) => {
        try {
            setLoading(true);
            const sanitizedPayload = {
                ...payload,
                multiplierToBase: payload.baseUnit ? 1 : payload.multiplierToBase
            };
            const response = await unitService.updateById(id, sanitizedPayload);
            if (response.status === "Success") {
                notify.success("Unit updated successfully");
                setunits((prev) => prev.map((u) => (u._id === id ? (response.data as UnitData) : u)));
                return true;
            }
        } finally {
            setLoading(false);
        }
        return false;
    };

    // 5. Delete Unit
    const removeUnit = async (id: string) => {
        try {
            setLoading(true);
            const response = await unitService.delete(id);
            if (response.success || response.status === "Success") {
                setunits((prev) => prev.filter((u) => u._id !== id));
                notify.success("Unit removed");
            }
        } finally {
            setLoading(false);
        }
    };

    return {
        units,
        singleUnit,
        isLoading,
        meta,
        fetchUnits,
        fetchUnitById,
        addUnit,
        updateUnit,
        removeUnit
    };
};