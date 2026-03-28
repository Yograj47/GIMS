import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Save, Trash2, ArrowLeft, Lightbulb, ShieldAlert } from "lucide-react";
import ProductForm from "../components/ProductForm";
import { Button } from "@/components/ui/button";
import { useProducts } from "../hooks/useProducts";
import type { ProductFormData } from "@/types/Product";
import { useCategories } from "@/features/category/hooks/useCategories";
import { useUnits } from "@/features/unit/hooks/useUnits";
import { Loading } from "@/lib/loader";
import { DeleteConfirmDialog } from "@/lib/deleteAlert"; // Your new utility

export default function ManageProduct() {
    const { productId } = useParams();
    const isEditMode = Boolean(productId);
    const navigate = useNavigate();

    // 1. Dialog State
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

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

    const confirmDelete = async () => {
        if (!productId) return;
        await removeProduct(productId);
        setIsDeleteDialogOpen(false);
        navigate("/products");
    };

    if (isEditMode && isLoading) return <Loading fullPage />;

    return (
        <div className="h-full space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-300 pb-6">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate("/products")}
                        className="text-slate-500 hover:text-blue-600 group"
                    >
                        <div className="w-8 h-8 rounded-sm bg-slate-100 flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                            <ArrowLeft size={16} strokeWidth={3} className="group-hover:-translate-x-1 transition-transform" />
                        </div>
                    </Button>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 tracking-tight uppercase">
                            {isEditMode ? "Modify Product" : "System Entry"}
                        </h1>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                            {isEditMode ? `ID: ${productId?.slice(-8)}` : "Product Creation"}
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                <div className="lg:col-span-2 bg-white border border-slate-300 rounded-sm shadow-sm overflow-hidden">
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
                    <div className="flex items-center justify-between bg-slate-50/50 border-t border-slate-300 px-6 py-4">
                        <div>
                            {isEditMode && (
                                <>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={() => setIsDeleteDialogOpen(true)}
                                        className="text-red-600 hover:bg-red-50 hover:text-red-500 text-[11px] font-bold uppercase gap-2 transition-colors"
                                    >
                                        <Trash2 size={14} /> Remove Item
                                    </Button>

                                    <DeleteConfirmDialog
                                        open={isDeleteDialogOpen}
                                        onOpenChange={setIsDeleteDialogOpen}
                                        onConfirm={confirmDelete}
                                        title="Confirm Product Deletion"
                                        itemName={singleProduct?.name || "this product"}
                                        isLoading={isLoading}
                                    />
                                </>
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

                    <div className="bg-white border border-slate-300 rounded-sm p-5">
                        <div className="flex items-center gap-2 mb-4 text-slate-900">
                            <ShieldAlert size={16} strokeWidth={3} />
                            <h3 className="font-bold text-[11px] uppercase tracking-widest text-slate-900">Validations</h3>
                        </div>
                        <div className="space-y-4">
                            <div className="flex gap-3">
                                <div className="h-4 w-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-[10px] font-black shrink-0">1</div>
                                <p className="text-slate-500 text-[11px] font-medium leading-tight">Threshold determines "Low Stock" alerts.</p>
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