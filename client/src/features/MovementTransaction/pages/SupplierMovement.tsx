import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { SupplierReceiving } from "@/features/suppliers/components/SupplierReceiving";
import { SupplierService } from "@/features/suppliers/api/supplier.service";
import { useSuppliers } from "@/features/suppliers/hooks/useSuppliers";
import { useProducts } from "@/features/products/hooks/useProducts";
import { useAuthStore } from "@/store/authStore";
import { useGlobalStore } from "@/store/globalStore";

export default function SupplierMovement({ mode }: { mode: "purchase" | "return" | "lots" }) {
    const navigate = useNavigate();
    const [params, setParams] = useSearchParams();
    const requestedSupplierId = params.get("supplierId") ?? "";
    const role = useAuthStore((state) => state.user?.role);
    const canWrite = role === "admin" || role === "owner";
    const [catalogResult, setCatalog] = useState<({ productIds: string[] } | { failed: true }) & { supplierId: string }>();
    const catalog = catalogResult?.supplierId === requestedSupplierId ? catalogResult : undefined;
    const [catalogAttempt, setCatalogAttempt] = useState(0);
    const { Suppliers, fetchSuppliers } = useSuppliers();
    const availableSuppliers = Suppliers.filter((supplier) => mode !== "purchase" || supplier.isActive);
    const supplierId = availableSuppliers.find((supplier) => supplier._id === requestedSupplierId)?._id ?? "";
    const { products, fetchProducts, isLoading: productsLoading } = useProducts();
    const { settings, fetchSettings } = useGlobalStore();
    useEffect(() => {
        void fetchSuppliers(undefined, undefined, undefined, true);
        void fetchSettings();
    }, [fetchSuppliers, fetchSettings]);

    useEffect(() => {
        void fetchProducts(undefined, undefined, undefined, undefined, undefined, true);
    }, [fetchProducts]);

    useEffect(() => {
        if (mode !== "purchase" || !supplierId) return;
        let current = true;
        SupplierService.getById(supplierId).then((response) => {
            if (!current) return;
            if (!response.success) {
                setCatalog({ supplierId, failed: true });
                return;
            }
            const assigned = response.meta?.products ?? response.productData ?? [];
            setCatalog({ supplierId, productIds: assigned.map((product) => product._id) });
        }).catch(() => {
            if (current) setCatalog({ supplierId, failed: true });
        });
        return () => { current = false; };
    }, [mode, supplierId, catalogAttempt]);
    return (
        <main className="min-h-dvh space-y-5 bg-background p-4 sm:p-6">
            <header className="space-y-2 border-b border-border pb-4">
                <button type="button" onClick={() => navigate(-1)} className="text-sm font-medium text-link hover:underline">← Back</button>
                <h1 className="text-2xl font-semibold">{mode === "purchase" ? "Supplier purchase" : mode === "return" ? "Return to supplier" : "Supplier stock lots"}</h1>
                {mode !== "lots" && (
                    <Link to={`/stock-movements/supplier-lots${supplierId ? `?supplierId=${supplierId}` : ""}`} className="inline-block text-sm font-medium text-link hover:underline">
                        View stock lots
                    </Link>
                )}
            </header>
            <label className="grid max-w-md gap-2 text-sm font-medium">Supplier
                <select className="h-11 rounded-lg border border-border bg-card px-3" value={supplierId} onChange={(event) => {
                    setCatalog(undefined);
                    setParams(event.target.value ? { supplierId: event.target.value } : {}, { replace: true });
                }}>
                    <option value="">Select supplier</option>
                    {availableSuppliers.map((supplier) => <option key={supplier._id} value={supplier._id}>{supplier.name}</option>)}
                </select>
            </label>
            {supplierId && mode === "purchase" && (
                catalog && "failed" in catalog
                    ? <div className="space-y-2">
                        <p role="alert" className="text-sm text-red-700">Could not load assigned products.</p>
                        <button type="button" className="text-sm font-medium text-link underline" onClick={() => {
                            setCatalog(undefined);
                            setCatalogAttempt((attempt) => attempt + 1);
                        }}>Retry loading products</button>
                    </div>
                    : (!catalog || productsLoading) && <p role="status" className="text-sm text-muted-foreground">Loading assigned products…</p>
            )}
            {supplierId && (mode !== "purchase" || (catalog && "productIds" in catalog && !productsLoading)) && <SupplierReceiving key={`${mode}:${supplierId}`} supplierId={supplierId} products={products}
                assignedProductIds={catalog && "productIds" in catalog ? catalog.productIds : []}
                canWrite={canWrite} currency={settings?.currency ?? "NPR"} mode={mode} />}
        </main>
    );
}
