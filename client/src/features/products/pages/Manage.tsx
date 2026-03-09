import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Save, Trash2, ArrowLeft, PackagePlus, FileEdit } from "lucide-react";
import ProductForm from "../components/ProductForm";
import { Button } from "@/components/ui/button";
import { useProducts } from "../hooks/useProducts";
import type { ProductFormData } from "@/types/Product";
import { useCategories } from "@/features/category/hooks/useCategories";
import { useUnits } from "@/features/unit/hooks/useUnits";
import { Loading } from "@/lib/loader";

export default function ManageProduct() {
    const { productId } = useParams();
    const isEditMode = Boolean(productId);
    const navigate = useNavigate();

    // custom hooks
    const {
        addProduct,
        updateProduct,
        removeProduct,
        singleProduct,
        fetchProductById,
        isLoading
    } = useProducts();

    const {
        categories,
        fetchCategories,
    } = useCategories();

    const {
        units,
        fetchUnits,
    } = useUnits();

    useEffect(() => {
        fetchCategories(undefined, undefined, undefined, true);
        fetchUnits(undefined, undefined, undefined, true);

        if (isEditMode && productId) {
            fetchProductById(productId);
        }
    }, [productId, isEditMode, fetchProductById, fetchCategories, fetchUnits]);

    const handleFormSubmit = async (data: ProductFormData) => {

        let finalPayload;

        if (!data.supplierId || data.supplierId === "") {
            const { supplierId, ...rest } = data;
            finalPayload = rest;
        } else {
            finalPayload = data;
        }


        let success = false;

        if (isEditMode && productId) {
            success = await updateProduct(productId, finalPayload);
        } else {
            success = await addProduct(data);
        }

        if (success) {
            navigate("/products");
        }
    };

    if (isEditMode && isLoading) {
        return <Loading fullPage />;
    }

    const handleDelete = async () => {
        if (!productId || !window.confirm("Are you sure you want to delete this product?")) return;

        await removeProduct(productId);
        navigate("/products");
    };

    return (
        <div className="min-h-full space-y-6 animate-in fade-in duration-500">
            {/* Header with Navigation */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        size="icon"
                        className="rounded-xl border-slate-200"
                        onClick={() => navigate("/products")}
                    >
                        <ArrowLeft size={18} />
                    </Button>
                    <div>
                        <div className="flex items-center gap-2">
                            {isEditMode ? <FileEdit className="text-blue-600" size={20} /> : <PackagePlus className="text-blue-600" size={20} />}
                            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                                {isEditMode ? "Update Product" : "Create New Item"}
                            </h1>
                        </div>
                        <p className="text-sm font-medium text-slate-500">
                            {isEditMode
                                ? `Managing details for ${singleProduct?.name || '...'}`
                                : "Add a new item to your grocery inventory"}
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Form Section */}
                <div className="lg:col-span-2">
                    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                        <div className="p-8">
                            {/* Loader state using hook data */}
                            {isEditMode && !singleProduct ? (
                                <div className="py-20 text-center text-slate-400 font-medium animate-pulse">
                                    Loading product data...
                                </div>
                            ) : (
                                <ProductForm
                                    initialData={isEditMode && singleProduct ? singleProduct : undefined}
                                    categories={categories}
                                    units={units}
                                    onSubmit={handleFormSubmit}
                                />
                            )}
                        </div>

                        {/* Unified Action Footer */}
                        <div className="flex items-center justify-between border-t border-slate-50 bg-slate-50/50 px-8 py-4">
                            <div>
                                {isEditMode && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={handleDelete}
                                        disabled={isLoading}
                                        className="text-red-500 hover:bg-red-50 hover:text-red-600 font-bold gap-2"
                                    >
                                        <Trash2 size={16} />
                                        Delete Product
                                    </Button>
                                )}
                            </div>

                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    type="button"
                                    onClick={() => navigate("/products")}
                                    disabled={isLoading}
                                    className="rounded-xl border-slate-200 font-bold px-6"
                                >
                                    Cancel
                                </Button>

                                <Button
                                    type="submit"
                                    form="product-form"
                                    disabled={isLoading}
                                    className="bg-blue-600 hover:bg-blue-700 rounded-xl font-bold px-8 shadow-lg shadow-blue-100"
                                >
                                    <Save size={16} className="mr-2" />
                                    {isLoading ? "Saving..." : isEditMode ? "Save Changes" : "Create Product"}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Info Sidebar */}
                <div className="space-y-6">
                    <div className="bg-blue-600 rounded-2xl p-6 text-white shadow-xl shadow-blue-100">
                        <h3 className="font-bold text-lg mb-2">Pro Tip</h3>
                        <p className="text-blue-100 text-sm leading-relaxed">
                            Ensure your <span className="text-white font-bold">Sell Price</span> is higher than your <span className="text-white font-bold">Buy Price</span> to maintain a healthy profit margin.
                        </p>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
                        <h3 className="font-bold text-slate-900">Inventory Logic</h3>
                        <div className="space-y-3">
                            <div className="flex gap-3 text-sm">
                                <div className="h-5 w-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">✓</div>
                                <p className="text-slate-600"><span className="font-bold">Threshold:</span> Set this to when you want to be warned of low stock.</p>
                            </div>
                            <div className="flex gap-3 text-sm">
                                <div className="h-5 w-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">i</div>
                                <p className="text-slate-600"><span className="font-bold">Units:</span> Select Kg, Liters, or Pieces carefully.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}