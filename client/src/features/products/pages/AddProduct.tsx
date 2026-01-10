import { Save } from "lucide-react";
import ProductForm from "../components/ProductForm";
import { Button } from "@/components/ui/button";

export default function AddProduct() {
    return (
        <div className="min-h-screen bg-[#F9FAFB] px-4 py-6">
            <div className="mx-auto max-w-5xl">
                {/* Page Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">
                        Add New Product
                    </h1>
                    <p className="text-sm text-gray-500">
                        Fill in the product details below
                    </p>
                </div>

                {/* Card */}
                <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
                    {/* Form */}
                    <div className="p-6">
                        <ProductForm />
                    </div>

                    {/* Action Bar */}
                    <div className="flex items-center justify-end gap-3 border-t bg-gray-50 px-6 py-4">
                        <Button variant="outline">
                            Cancel
                        </Button>

                        <Button className="flex items-center gap-2">
                            <Save size={18} />
                            Save Product
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}


