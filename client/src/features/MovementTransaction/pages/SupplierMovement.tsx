import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { SupplierReceiving } from "@/features/suppliers/components/SupplierReceiving";
import { SupplierService } from "@/features/suppliers/api/supplier.service";
import { useSuppliers } from "@/features/suppliers/hooks/useSuppliers";
import { useProducts } from "@/features/products/hooks/useProducts";
import { useGlobalStore } from "@/store/globalStore";

export default function SupplierMovement({ mode }: { mode: "purchase" | "return" }) {
    const [supplierId, setSupplierId] = useState("");
    const [catalog, setCatalog] = useState<{ productIds: string[] } | { failed: true } | null>(null);
    const [catalogAttempt, setCatalogAttempt] = useState(0);
    const { Suppliers, fetchSuppliers } = useSuppliers();
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
                setCatalog({ failed: true });
                return;
            }
            const assigned = response.meta?.products ?? response.productData ?? [];
            setCatalog({ productIds: assigned.map((product) => product._id) });
        }).catch(() => {
            if (current) setCatalog({ failed: true });
        });
        return () => { current = false; };
    }, [mode, supplierId, catalogAttempt]);
    return (
        <main className="min-h-dvh space-y-5 bg-market-paper p-4 sm:p-6">
            <header className="space-y-2 border-b border-slate-200 pb-4">
                <Link to="/stock-movements" className="text-sm font-medium text-brand-700 hover:underline">← Stock movements</Link>
                <h1 className="text-2xl font-semibold">{mode === "purchase" ? "Supplier purchase" : "Return to supplier"}</h1>
                <p className="text-sm text-slate-600">{mode === "purchase" ? "Record stock received against the supplier’s delivery." : "Choose the supplier and original lot to return damaged or unwanted stock."}</p>
            </header>
            <label className="grid max-w-md gap-2 text-sm font-medium">Supplier
                <select className="h-11 rounded-lg border border-slate-200 bg-white px-3" value={supplierId} onChange={(event) => {
                    setCatalog(null);
                    setSupplierId(event.target.value);
                }}>
                    <option value="">Select supplier</option>
                    {Suppliers.filter((supplier) => mode === "return" || supplier.isActive).map((supplier) => <option key={supplier._id} value={supplier._id}>{supplier.name}</option>)}
                </select>
            </label>
            {supplierId && mode === "purchase" && (
                catalog && "failed" in catalog
                    ? <div className="space-y-2">
                        <p role="alert" className="text-sm text-red-700">Could not load assigned products.</p>
                        <button type="button" className="text-sm font-medium text-brand-700 underline" onClick={() => {
                            setCatalog(null);
                            setCatalogAttempt((attempt) => attempt + 1);
                        }}>Retry loading products</button>
                    </div>
                    : (!catalog || productsLoading) && <p role="status" className="text-sm text-slate-600">Loading assigned products…</p>
            )}
            {supplierId && (mode === "return" || (catalog && "productIds" in catalog && !productsLoading)) && <SupplierReceiving key={supplierId} supplierId={supplierId} products={products}
                assignedProductIds={catalog && "productIds" in catalog ? catalog.productIds : []}
                canWrite currency={settings?.currency ?? "NPR"} mode={mode} />}
        </main>
    );
}
