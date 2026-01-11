import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Save, Trash2 } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";

import ProductForm from "../components/ProductForm";
import { Button } from "@/components/ui/button";
import { useGlobalStore } from "@/store/globalStore";
import type { ProductAPIResponse, ProductFormData } from "@/interface/Product";

export default function EditProduct() {
    const { productId } = useParams();
    const navigate = useNavigate();
    const { backendUrl, isLoading, setLoading } = useGlobalStore();

    const [product, setProduct] = useState<ProductAPIResponse | undefined>(undefined);

    // 1. Get Product Data on Mount
    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${backendUrl}/products/${productId}`, {
                    withCredentials: true
                });
                if (response.data.status === "success") {
                    setProduct(response.data.data);
                }
            } catch (error: any) {
                toast.error(error?.response?.data?.message || "Failed to load product");
                navigate("/products");
            } finally {
                setLoading(false);
            }
        };

        if (productId) fetchProduct();
    }, [productId, backendUrl, navigate, setLoading]);

    // 2. Update Product
    const onUpdate = async (data: ProductFormData) => {
        try {
            setLoading(true);
            const response = await axios.put(`${backendUrl}/products/${productId}`, data, {
                withCredentials: true
            });

            if (response.data.status === "success") {
                toast.success(response.data.message || "Product updated successfully");
                navigate("/products");
            }
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Update failed");
        } finally {
            setLoading(false);
        }
    };

    // 3. Delete Product
    const onDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this product?")) return;

        try {
            setLoading(true);
            const response = await axios.delete(`${backendUrl}/products/${productId}`, {
                withCredentials: true
            });

            if (response.data.status === "success") {
                toast.success("Product deleted");
                navigate("/products");
            }
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Delete failed");
        } finally {
            setLoading(false);
        }
    };

    if (!product && !isLoading) return <div className="p-8 text-center">Product not found.</div>;

    return (
        <div className="min-h-screen bg-[#F9FAFB] px-4 py-6">
            <div className="mx-auto max-w-5xl">
                {/* Page Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
                    <p className="text-sm text-gray-500">Update product details or manage its status</p>
                </div>

                <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
                    <div className="p-6">
                        {/* Only render form when product data is ready */}
                        {product && <ProductForm initialData={product} onSubmit={onUpdate} />}
                    </div>

                    {/* Action Bar */}
                    <div className="flex items-center justify-between border-t bg-gray-50 px-6 py-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onDelete}
                            disabled={isLoading}
                            className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
                        >
                            <Trash2 size={16} />
                            {isLoading ? "Processing..." : "Delete"}
                        </Button>

                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                type="button"
                                onClick={() => navigate("/products")}
                                disabled={isLoading}
                            >
                                Cancel
                            </Button>

                            <Button
                                type="submit"
                                form="product-form"
                                disabled={isLoading}
                                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                            >
                                <Save size={16} />
                                {isLoading ? "Saving..." : "Save Changes"}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}