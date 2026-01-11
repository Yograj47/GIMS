import { Save } from "lucide-react";
import ProductForm from "../components/ProductForm";
import { Button } from "@/components/ui/button";
import type { ProductFormData } from "@/interface/Product";
import { useNavigate } from "react-router-dom";
import { useGlobalStore } from "@/store/globalStore";
import axios from "axios";
import { toast } from "react-toastify";

export default function AddProduct() {
    const { backendUrl, isLoading, setLoading } = useGlobalStore();
    const navigate = useNavigate();

    const onSubmit = async (data: ProductFormData) => {
        try {
            setLoading(true);
            const response = await axios.post(`${backendUrl}/products/`, data, {
                withCredentials: true
            });

            // Use toast.success instead of toast.done
            if (response?.data?.status === "success") {
                toast.success(response?.data?.message || "Product added successfully");
                navigate("/products"); // Navigate back on success
            } else {
                toast.error(response?.data?.message || "Something went wrong");
            }
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Server Error");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="h-full bg-[#F9FAFB] px-4 py-6">
            <div className="mx-auto max-w-5xl">
                {/* Page Header */}
                <div className="mb-4">
                    <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
                    <p className="text-sm text-gray-500">Fill in the product details below</p>
                </div>

                <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
                    <div className="p-6">
                        <ProductForm onSubmit={onSubmit} />
                    </div>

                    {/* Action Bar */}
                    <div className="flex items-center justify-start gap-3 border-t bg-gray-50 px-6 py-4">
                        <Button
                            className={`flex items-center gap-2 ${isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
                            type="submit"
                            form="product-form"
                            disabled={isLoading} 
                        >
                            {isLoading ? (
                                "Saving..."
                            ) : (
                                <>
                                    <Save size={18} />
                                    Save Product
                                </>
                            )}
                        </Button>

                        <Button
                            variant="outline"
                            disabled={isLoading}
                            className="border border-gray-300 text-gray-700 hover:bg-gray-100"
                            onClick={() => navigate("/products")}
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}