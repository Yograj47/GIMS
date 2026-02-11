import { useState, useCallback } from 'react';
import { useGlobalStore } from '@/store/globalStore';
import { notify } from '@/lib/toast';
import { SupplierService } from '../api/SupplierService';
import type { SupplierProduct, SupplierData, SupplierFormData, } from '@/types/Supplier';

export const useSuppliers = () => {
    const [Suppliers, setSuppliers] = useState<SupplierData[]>([]);
    const [singleSupplier, setSingleSupplier] = useState<SupplierData | null>(null);
    const [productData, setProductData] = useState<SupplierProduct[] | null>(null);
    const { setLoading, isLoading } = useGlobalStore();

    // 1. Fetch All Suppliers
    const fetchSuppliers = useCallback(async () => {
        try {
            setLoading(true);
            const response = await SupplierService.getAll();
            if (response.status === "Success") {
                setSuppliers(response.data as SupplierData[]);
                console.log("Hooks:",response.data);
                
            }
        } catch (error: any) {
            // the error notification happens automatically!
        } finally {
            setLoading(false);
        }
    }, [setLoading]);

    // 2. Fetch Single Supplier (for Edit/View pages)
    const fetchSupplierById = useCallback(async (id: string) => {
        try {
            setLoading(true);
            const response = await SupplierService.getById(id);
            if (response.status === "Success") {
                const data = response.data as SupplierData;
                setSingleSupplier(data);
                setProductData(response.productData as SupplierProduct[]);
                return data;
            }
        } finally {
            setLoading(false);
        }
    }, [setLoading]);

    // 3. Create Supplier
    const addSupplier = async (payload: SupplierFormData) => {
        try {
            setLoading(true);
            const response = await SupplierService.create(payload);
            if (response.status === "Success") {
                notify.success("Supplier added successfully");
                return true;
            }
        } finally {
            setLoading(false);
        }
        return false;
    };

    // 4. Update Supplier
    const updateSupplier = async (id: string, payload: SupplierFormData) => {
        try {
            setLoading(true);
            const response = await SupplierService.updateById(id, payload);
            if (response.status === "Success") {
                notify.success("Supplier updated successfully");
                return true;
            }
        } finally {
            setLoading(false);
        }
        return false;
    };

    // 5. Delete Supplier
    const removeSupplier = async (id: string) => {
        try {
            setLoading(true);
            const response = await SupplierService.delete(id);
            if (response.success || response.status === "Success") {
                setSuppliers((prev) => prev.filter((c) => c._id !== id));
                notify.success("Product removed");
            }
        } finally {
            setLoading(false);
        }
    };

    return {
        Suppliers,
        singleSupplier,
        isLoading,
        fetchSuppliers,
        productData,
        fetchSupplierById,
        addSupplier,
        updateSupplier,
        removeSupplier
    };
};