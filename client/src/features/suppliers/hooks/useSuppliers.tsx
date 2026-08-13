import { useState, useCallback } from 'react';
import { notify } from '@/lib/toast';
import { SupplierService } from '../api/supplier.service';
import type { SupplierProduct, SupplierData, SupplierFormData, } from '@/types/supplier';
import type { PaginationMetadata } from '@/types/pagination';

export const useSuppliers = () => {
    const [Suppliers, setSuppliers] = useState<SupplierData[]>([]);
    const [singleSupplier, setSingleSupplier] = useState<SupplierData | null>(null);
    const [productData, setProductData] = useState<SupplierProduct[] | null>(null);
    const [isLoading, setLoading] = useState(false);
    const [meta, setMeta] = useState<PaginationMetadata | null>(null);

    const fetchSuppliers = useCallback(async (page? : number, limit?:number, search?:string, all? :boolean ) => {
        try {
            setLoading(true);
            const response = await SupplierService.getAll(page, limit, search, all);
            if (response.success) {
                setSuppliers(response.data as SupplierData[]);
                setMeta(all ? null : (response.meta || null));
                return true;

            }
        } catch (error: any) {
        } finally {
            setLoading(false);
        }
    }, [setLoading]);

    const fetchSupplierById = useCallback(async (id: string) => {
        try {
            setLoading(true);
            const response = await SupplierService.getById(id);
            if (response.success) {
                const data = response.data as SupplierData;
                setSingleSupplier(data);
                setProductData(response.productData as SupplierProduct[]);
                return data;
            }
        } finally {
            setLoading(false);
        }
    }, [setLoading]);

    const addSupplier = async (payload: SupplierFormData) => {
        try {
            setLoading(true);
            const response = await SupplierService.create(payload);
            if (response.success) {
                setSuppliers((prev) => [...prev, response.data as SupplierData]);
                notify.success("Supplier added successfully");
                return true;
            }
        } finally {
            setLoading(false);
        }
        return false;
    };

    const updateSupplier = async (id: string, payload: SupplierFormData) => {
        try {
            setLoading(true);
            const response = await SupplierService.updateById(id, payload);
            if (response.success) {
                setSuppliers((prev) => prev.map((c) => (c._id === id ? (response.data as SupplierData) : c)));
                notify.success("Supplier updated successfully");
                return true;
            }
        } finally {
            setLoading(false);
        }
        return false;
    };

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

    const assignProducts = async (supplierId: string, productIds: string[]) => {
        try {
            setLoading(true);
            const response = await SupplierService.assignProducts(supplierId, productIds);
            if (response.status === "Success") {
                notify.success(response.message || "Products linked successfully");
                await fetchSupplierById(supplierId);
                return true;
            }
        } finally {
            setLoading(false);
        }
        return false;
    };

    const removeProductFromSupplier = async (supplierId: string, productId: string) => {
        try {
            setLoading(true);
            const response = await SupplierService.unassignProduct(productId);
            if (response.status === "Success") {
                notify.success("Product removed from catalog");
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