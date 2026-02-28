import { useState, useCallback } from 'react';
import { useGlobalStore } from '@/store/globalStore';
import { notify } from '@/lib/toast';
import { SupplierService } from '../api/SupplierService';
import type { SupplierProduct, SupplierData, SupplierFormData, } from '@/types/Supplier';
import type { PaginationMetadata } from '@/types/Unit';

export const useSuppliers = () => {
    const [Suppliers, setSuppliers] = useState<SupplierData[]>([]);
    const [singleSupplier, setSingleSupplier] = useState<SupplierData | null>(null);
    const [productData, setProductData] = useState<SupplierProduct[] | null>(null);
    const { setLoading, isLoading } = useGlobalStore();
    const [meta, setMeta] = useState<PaginationMetadata | null>(null);

    // 1. Fetch All Suppliers
    const fetchSuppliers = useCallback(async (page?: number, limit?: number, search?: string, all?:boolean) => {
        try {
            setLoading(true);
            const response = await SupplierService.getAll(page, limit, search, all);
            if (response.status === "Success") {
                setSuppliers(response.data as SupplierData[]);
                setMeta(all ? null : (response.meta || null));
                return true;

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
                setSuppliers((prev) => [...prev, response.data as SupplierData]);
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
                setSuppliers((prev) => prev.map((c) => (c._id === id ? (response.data as SupplierData) : c)));
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
                notify.success("Supplier removed");
                return true;
            }
        } finally {
            setLoading(false);
        }
        return false;
    };

    /**
     * @desc Links multiple products to a supplier and refreshes catalog
     */
    const assignProducts = async (supplierId: string, productIds: string[]) => {
        try {
            setLoading(true);
            const response = await SupplierService.assignProducts(supplierId, productIds);
            if (response.status === "Success") {
                notify.success(response.message || "Products linked successfully");
                // Refresh the local product catalog table
                await fetchSupplierById(supplierId);
                return true;
            }
        } finally {
            setLoading(false);
        }
        return false;
    };

    /**
     * @desc Unlinks a product from its supplier and refreshes catalog
     */
    const removeProductFromSupplier = async (supplierId: string, productId: string) => {
        try {
            setLoading(true);
            const response = await SupplierService.unassignProduct(productId);
            if (response.status === "Success") {
                notify.success("Product removed from catalog");
                // Refresh the local product catalog table
                await fetchSupplierById(supplierId);
                return true;
            }
        } finally {
            setLoading(false);
        }
        return false;
    };

    return {
        Suppliers,
        singleSupplier,
        isLoading,
        meta,
        fetchSuppliers,
        productData,
        fetchSupplierById,
        addSupplier,
        updateSupplier,
        removeSupplier,
        assignProducts,
        removeProductFromSupplier
    };
};