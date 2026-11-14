import { useEffect, useState } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { productService } from "@/features/products/api/product.service";
import { useDebounce } from "@/lib/debounce";
import { formatInvoiceMoney } from "@/types/billing";
import type { ProductData } from "@/types/product";
import type { Item } from "@/types/transaction";

export function RegisterCatalog({ inbound, onAdd, usedStock }: {
    inbound: boolean;
    onAdd: (item: Item) => void;
    usedStock: Map<string, number>;
}) {
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const query = useDebounce(search.trim(), 250);
    const [result, setResult] = useState<{ key: string; items: ProductData[]; pages: number; failed?: boolean }>();
    const [retry, setRetry] = useState(0);
    const key = JSON.stringify([query, page, retry]);

    useEffect(() => {
        const controller = new AbortController();
        productService.getAll(page, 12, query, undefined, undefined, false, "name", controller.signal).then(
            (response) => {
                if (!controller.signal.aborted) setResult({ key, items: response.data ?? [], pages: response.meta?.totalPages ?? 1, failed: !response.success });
            },
            () => { if (!controller.signal.aborted) setResult({ key, items: [], pages: 0, failed: true }); },
        );
        return () => controller.abort();
    }, [page, query, key]);

    const loading = key !== result?.key || query !== search.trim();
    return (
        <section aria-label="Product catalog" className="min-w-0 space-y-4 rounded-xl border border-border bg-card p-4 sm:p-5">
            <h2 className="text-base font-semibold">Products</h2>
            <div className="relative">
                <Search size={18} aria-hidden="true" className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground" />
                <Input aria-label="Search products" placeholder="Search products by name" value={search}
                    onChange={(event) => { setSearch(event.target.value); setPage(1); }} className="h-11 pl-10" />
            </div>
            {loading ? <Skeleton role="status" aria-label="Loading products" className="h-44 w-full" /> : result?.failed ? (
                <Button type="button" variant="outline" onClick={() => setRetry((value) => value + 1)}>Retry loading products</Button>
            ) : result?.items.length ? (
                <div className="overflow-auto lg:max-h-[65dvh]" tabIndex={0} role="region" aria-label="Available products">
                    <table className="records-table w-full text-left text-sm">
                        <thead className="sticky top-0 bg-secondary text-xs text-foreground">
                            <tr><th className="p-3">Product</th><th className="p-3">Unit</th><th className="p-3 text-right">Price</th><th className="p-3"><span className="sr-only">Add product</span></th></tr>
                        </thead>
                        <tbody>{result.items.map((product) => <RegisterProduct key={product._id} product={product} inbound={inbound}
                            used={usedStock.get(product._id) ?? 0} onAdd={onAdd} />)}</tbody>
                    </table>
                </div>
            ) : <p className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">No products found.</p>}
            {!loading && (page > 1 || (result?.pages ?? 0) > 1) && (
                <div className="flex items-center justify-between gap-2 text-sm">
                    <Button type="button" variant="outline" disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</Button>
                    <span>Page {page} of {result?.pages}</span>
                    <Button type="button" variant="outline" disabled={page >= (result?.pages ?? 0)} onClick={() => setPage(page + 1)}>Next</Button>
                </div>
            )}
        </section>
    );
}

function RegisterProduct({ product, inbound, used, onAdd }: {
    product: ProductData; inbound: boolean; used: number; onAdd: (item: Item) => void;
}) {
    const [unitId, setUnitId] = useState("");
    const units = product.sellingUnits ?? [];
    const unit = units.find((item) => item.unitId._id === unitId) ?? units.find((item) => item.isDefault) ?? units[0];
    const pricePerBase = (inbound ? product.basePrice : product.sellingPrice) / product.unit.multiplierToBase;
    const rate = unit ? Math.round(pricePerBase * unit.multiplier * 100) / 100 : 0;
    const available = Math.max(0, product.quantity - used);
    const quantity = unit && !inbound && available < unit.multiplier && unit.isFractionable ? 0.001 : 1;
    const canAdd = Boolean(unit && product.isActive && (inbound || available >= quantity * unit.multiplier));

    return (
        <tr data-record>
            <th scope="row" className="min-w-24 p-3 font-normal">
                    <p className="break-words text-sm font-semibold">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{available.toLocaleString()} {product.baseUnit?.shortForm ?? product.unit.shortForm} in stock</p>
            </th>
            <td className="min-w-24 p-3">
                {unit ?
                    <select aria-label={`Unit for ${product.name}`} value={unit.unitId._id} onChange={(event) => setUnitId(event.target.value)}
                        className="h-9 w-full min-w-0 rounded-md border border-border bg-card px-2 text-sm">
                        {units.map((option) => <option key={option._id} value={option.unitId._id}>{option.unitId.name}</option>)}
                    </select> : <span className="text-xs text-muted-foreground">No unit</span>}
            </td>
            <td className="whitespace-nowrap p-3 text-right tabular-nums">{unit ? formatInvoiceMoney(Math.round(rate * 100), "NPR") : "—"}</td>
            <td className="p-3 text-right">
                <Button type="button" size="sm" disabled={!canAdd} aria-label={`Add ${product.name}`} onClick={() => {
                    if (!unit || !canAdd) return;
                    onAdd({ productId: product._id, productName: product.name, unitId: unit.unitId._id,
                        unitName: unit.unitId.name, multiplier: unit.multiplier, qty: quantity,
                        baseQuantity: quantity * unit.multiplier, isFractionable: unit.isFractionable,
                        pricePerBase, rate, total: Math.round(quantity * rate * 100) / 100 });
                }}><Plus size={16} /> Add</Button>
            </td>
        </tr>
    );
}
