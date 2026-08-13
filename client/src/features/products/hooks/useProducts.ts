import { useState, useCallback } from 'react';
import { notify } from '@/lib/toast';
import { productService } from '../api/product.service';
import type { ProductData, ProductFormData } from '@/types/product';
import type { PaginationMetadata } from '@/types/pagination';

export const useProducts = () => {
    const [products, setProducts] = useState<ProductData[]>([]);
    const [singleProduct, setSingleProduct] = useState<ProductData | null>(null);
    const [isLoading, setLoading] = useState(false);
    const [meta, setMeta] = useState<PaginationMetadata | null>(null);

    const fetchProducts = useCallback(async (page?: number, limit?: number, search?: string, category?: string, stockLevel?: string, all?: boolean) => {
        try {
            setLoading(true);
            const response = await productService.getAll(page, limit, search, category, stockLevel, all);
            if (response.success) {
                setProducts(response.data as ProductData[]);
                setMeta(all ? null : (response.meta || null));
                return true;
            }
        } catch {
            notify.error("Failed to fetch")
        } finally {
            setLoading(false);
        }
    }, [setLoading]);

    const fetchProductById = useCallback(async (id: string) => {
        try {
            setLoading(true);
            const response = await productService.getById(id);
            if (response.success) {
                const data = response.data as ProductData;
                setSingleProduct(data);
                return data;
            }
        } finally {
            setLoading(false);
        }
    }, [setLoading]);

    const addProduct = async (payload: ProductFormData) => {
        try {
            setLoading(true);
            const response = await productService.create(payload);
            if (response.success) {
                setProducts((prev) => [...prev, response.data as ProductData]);
                notify.success("Product added successfully");
                return true;
            }
        } finally {
            setLoading(false);
        }
        return false;
    };

    const updateProduct = async (id: string, payload: ProductFormData) => {
        try {
            setLoading(true);
            const response = await productService.updateById(id, payload);
            if (response.success) {
                setProducts((prev) => prev.map((c) => (c._id === id ? (response.data as ProductData) : c)));
                notify.success("Product updated successfully");
                return true;
            }
        } finally {
            setLoading(false);
        }
        return false;
    };

    const removeProduct = async (id: string) => {
        try {
            setLoading(true);
            const response = await productService.delete(id);
            if (response.success || response.status === "Success") {
                setProducts((prev) => prev.filter((p) => p._id !== id));
                notify.success("Product removed");
            }
        } finally {
            setLoading(false);
        }
    };

    return {
        products,
        singleProduct,
        isLoading,
        fetchProducts,
        fetchProductById,
        addProduct,
        updateProduct,
        removeProduct,
        meta
    };
};