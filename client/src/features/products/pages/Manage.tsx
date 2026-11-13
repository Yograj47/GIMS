import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { EntityFormPage } from "@/components/common/EntityFormPage";
import type { ProductFormData } from "@/types/product";
import ProductForm from "../components/ProductForm";
import { useProducts } from "../hooks/useProducts";
import { Button } from "@/components/ui/button";
import { DeleteConfirmDialog } from "@/lib/deleteAlert";
import { useCategories } from "@/features/category/hooks/useCategories";
import { useUnits } from "@/features/unit/hooks/useUnits";

export default function ManageProduct() {
    const { productId } = useParams();
    return <ProductEditor key={productId ?? "new"} id={productId} />;
}

function ProductEditor({ id }: { id?: string }) {
    const navigate = useNavigate();
    const { addProduct, updateProduct, fetchProductById, singleProduct, isLoading, removeProduct } = useProducts();
    const [loading, setLoading] = useState(Boolean(id));
    const [attempt, setAttempt] = useState(0);
    const [deleting, setDeleting] = useState(false);
    const { categories, fetchCategories } = useCategories();
    const { units, fetchUnits } = useUnits();

    useEffect(() => {
        void fetchCategories(undefined, undefined, undefined, true);
        void fetchUnits(undefined, undefined, undefined, true);
    }, [fetchCategories, fetchUnits]);

    useEffect(() => {
        if (!id) return;
        let active = true;
        fetchProductById(id).catch(() => {
            // The page shows a retry when loading fails.
        }).finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, [id, attempt, fetchProductById]);

    async function submit(data: ProductFormData) {
        const update: Partial<ProductFormData> = { ...data };
        delete update.quantity;
        if (!update.supplierId) delete update.supplierId;
        const saved = id ? await updateProduct(id, update) : await addProduct(data);
        if (saved) navigate("/products");
    }

    return (
        <EntityFormPage
            title={id ? "Edit product" : "Add product"}
            description={singleProduct?.name}
            backTo="/products"
            backLabel="Back to products"
            formId="product-form"
            submitLabel={id ? "Save changes" : "Add product"}
            saving={isLoading}
            loading={loading}
            loadError={id && !singleProduct ? "Couldn’t load this product." : undefined}
            onRetry={() => { setLoading(true); setAttempt((value) => value + 1); }}
            secondaryAction={id && <>
                <Button type="button" variant="ghost" disabled={isLoading} className="text-red-700 hover:bg-red-50 hover:text-red-800" onClick={() => setDeleting(true)}>
                    Delete product
                </Button>
                <DeleteConfirmDialog
                    open={deleting}
                    onOpenChange={setDeleting}
                    onConfirm={async () => {
                        await removeProduct(id);
                        setDeleting(false);
                        navigate("/products");
                    }}
                    title="Delete product?"
                    itemName={singleProduct?.name ?? "this product"}
                    isLoading={isLoading}
                />
            </>}
        >
            <ProductForm initialData={singleProduct ?? undefined} categories={categories} units={units} onSubmit={submit} />
        </EntityFormPage>
    );
}
