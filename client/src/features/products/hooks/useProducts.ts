import { useState, useCallback } from 'react';
import { useGlobalStore } from '@/store/globalStore';
import { notify } from '@/lib/toast';
import { productService } from '../../../service/ProductService';
import type { ProductData, ProductFormData } from '@/types/Product';
import type { PaginationMetadata } from '@/types/Pagination';

export const useProducts = () => {
    const [products, setProducts] = useState<ProductData[]>([]);
    const [singleProduct, setSingleProduct] = useState<ProductData | null>(null);
    const { setLoading, isLoading } = useGlobalStore();
    const [meta, setMeta] = useState<PaginationMetadata | null>(null);

    // 1. Fetch All Products
    const fetchProducts = useCallback(async (page?: number, limit?: number, search?: string, category?: string, stockLevel?: string, all?: boolean) => {
        try {
            setLoading(true);
            const response = await productService.getAll(page, limit, search, category, stockLevel, all);
            if (response.status === "Success") {
                setProducts(response.data as ProductData[]);
                setMeta(all ? null : (response.meta || null));
                return true;
            }
        } catch (error: any) {
            // the error notification happens automatically!
        } finally {
            setLoading(false);
        }
    }, [setLoading]);

    // 2. Fetch Single Product (for Edit/View pages)
    const fetchProductById = useCallback(async (id: string) => {
        try {
            setLoading(true);
            const response = await productService.getById(id);
            if (response.status === "Success") {
                const data = response.data as ProductData;
                setSingleProduct(data);
                return data;
            }
        } finally {
            setLoading(false);
        }
    }, [setLoading]);

    // 3. Create Product
    const addProduct = async (payload: ProductFormData) => {
        try {
            setLoading(true);
            const response = await productService.create(payload);
            if (response.status === "Success") {
                setProducts((prev) => [...prev, response.data as ProductData]);
                notify.success("Product added successfully");
                return true;
            }
        } finally {
            setLoading(false);
        }
        return false;
    };

    // 4. Update Product
    const updateProduct = async (id: string, payload: ProductFormData) => {
        try {
            setLoading(true);
            const response = await productService.updateById(id, payload);
            if (response.status === "Success") {
                setProducts((prev) => prev.map((c) => (c._id === id ? (response.data as ProductData) : c)));
                notify.success("Product updated successfully");
                return true;
            }
        } finally {
            setLoading(false);
        }
        return false;
    };

    // 5. Delete Product
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