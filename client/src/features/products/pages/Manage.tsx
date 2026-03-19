import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Save, Trash2, ArrowLeft, Lightbulb, ShieldAlert } from "lucide-react";
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

    const {
        addProduct,
        updateProduct,
        removeProduct,
        singleProduct,
        fetchProductById,
        isLoading
    } = useProducts();

    const { categories, fetchCategories } = useCategories();
    const { units, fetchUnits } = useUnits();

    useEffect(() => {
        fetchCategories(undefined, undefined, undefined, true);
        fetchUnits(undefined, undefined, undefined, true);

        if (isEditMode && productId) {
            fetchProductById(productId);
        }
    }, [productId, isEditMode, fetchProductById, fetchCategories, fetchUnits]);

    const handleFormSubmit = async (data: ProductFormData) => {
        let finalPayload = (!data.supplierId || data.supplierId === "") 
            ? (() => { const { supplierId, ...rest } = data; return rest; })() 
            : data;

        let success = isEditMode && productId 
            ? await updateProduct(productId, finalPayload) 
            : await addProduct(data);

        if (success) navigate("/products");
    };

    if (isEditMode && isLoading) return <Loading fullPage />;

    const handleDelete = async () => {
        if (!productId || !window.confirm("Are you sure you want to delete this product?")) return;
        await removeProduct(productId);
        navigate("/products");
    };

    return (
        <div className="h-full space-y-6 animate-in fade-in duration-500">
            {/* Header: Sharp & Professional */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-6">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full border-3 border-slate-200 hover:bg-white hover:border-slate-600 transition-all"
                        onClick={() => navigate("/products")}
                    >
                        <ArrowLeft size={16} strokeWidth={3} />
                    </Button>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl font-bold text-slate-900 tracking-tight uppercase">
                                {isEditMode ? "Modify Product" : "System Entry"}
                            </h1>
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                            {isEditMode ? `ID: ${productId?.slice(-8)}` : "Product Creation"}
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                {/* Main Form Section */}
                <div className="lg:col-span-2 bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden">
                    <div className="p-6">
                        {isEditMode && !singleProduct ? (
                            <div className="py-20 text-center text-slate-400 text-xs font-bold uppercase tracking-widest animate-pulse">
                                Syncing Database...
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

                    {/* Action Footer */}
                    <div className="flex items-center justify-between bg-slate-50/50 border-t border-slate-100 px-6 py-4">
                        <div>
                            {isEditMode && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={handleDelete}
                                    className="text-red-600 hover:bg-red-50 text-[11px] font-bold uppercase gap-2"
                                >
                                    <Trash2 size={14} /> Remove Item
                                </Button>
                            )}
                        </div>

                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                type="button"
                                onClick={() => navigate("/products")}
                                className="border-slate-200 text-[11px] font-bold uppercase h-9 px-4 rounded-sm"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                form="product-form"
                                disabled={isLoading}
                                className="bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold uppercase h-9 px-6 rounded-sm shadow-sm transition-all active:scale-95"
                            >
                                <Save size={14} className="mr-2" />
                                {isLoading ? "Processing..." : isEditMode ? "Commit Changes" : "Confirm Entry"}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-4">
                    <div className="bg-slate-900 rounded-sm p-5 text-white shadow-lg">
                        <div className="flex items-center gap-2 mb-3 text-blue-400">
                            <Lightbulb size={16} strokeWidth={3} />
                            <h3 className="font-bold text-[11px] uppercase tracking-widest">Financial Logic</h3>
                        </div>
                        <p className="text-slate-400 text-xs leading-relaxed font-medium">
                            The system calculates <span className="text-white">Gross Margin</span> automatically. Ensure Selling Price accounts for VAT and operational overhead.
                        </p>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-sm p-5">
                        <div className="flex items-center gap-2 mb-4 text-slate-900">
                            <ShieldAlert size={16} strokeWidth={3} />
                            <h3 className="font-bold text-[11px] uppercase tracking-widest text-slate-900">Validations</h3>
                        </div>
                        <div className="space-y-4">
                            <div className="flex gap-3">
                                <div className="h-4 w-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-[10px] font-black shrink-0">1</div>
                                <p className="text-slate-500 text-[11px] font-medium leading-tight">Threshold determines "Low Stock" alerts in the dashboard.</p>
                            </div>
                            <div className="flex gap-3">
                                <div className="h-4 w-4 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-black shrink-0">2</div>
                                <p className="text-slate-500 text-[11px] font-medium leading-tight">Units are locked once transactions are recorded.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}