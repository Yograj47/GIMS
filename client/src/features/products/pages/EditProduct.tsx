import { Save, Trash2 } from "lucide-react";
import ProductForm from "../components/ProductForm";
import { Button } from "@/components/ui/button";
import type { ProductAPIResponse } from "@/interface/Product";

export default function EditProduct({ product }: { product?: ProductAPIResponse }) {
    return (
        <div className="min-h-screen bg-[#F9FAFB] px-4 py-6">
            <div className="mx-auto max-w-5xl">
                {/* Page Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">
                        Edit Product
                    </h1>
                    <p className="text-sm text-gray-500">
                        Update product details or manage its status
                    </p>
                </div>

                {/* Card */}
                <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
                    {/* Form */}
                    <div className="p-6">
                        <ProductForm initialData={product} />
                    </div>

                    {/* Action Bar */}
                    <div className="flex items-center justify-between border-t bg-gray-50 px-6 py-4">
                        {/* Left */}
                        <Button
                            variant="outline"
                            className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
                        >
                            <Trash2 size={16} />
                            Delete
                        </Button>

                        {/* Right */}
                        <div className="flex gap-3">
                            <Button variant="outline">
                                Cancel
                            </Button>

                            <Button className="flex items-center gap-2">
                                <Save size={16} />
                                Save Changes
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
