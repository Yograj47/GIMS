import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import api from "@/lib/api";
import type { ProductData } from "@/types/product";

type Lot = {
    _id: string;
    productId: string;
    receiptId: string;
    batchNumber?: string;
    expiresOn?: string;
    sellableQuantity: number;
    quarantinedQuantity: number;
};

type SupplierReturn = {
    _id: string;
    lotId: string;
    receiptId: string;
    baseQuantity: number;
    reason: string;
    createdAt: string;
};

const field = "min-w-0 rounded-md border border-input bg-card px-3 py-2 text-sm";
const hint = "text-xs font-normal leading-relaxed text-muted-foreground";

export function SupplierReceiving({ supplierId, products, assignedProductIds, canWrite, currency, mode }: {
    supplierId: string;
    products: ProductData[];
    assignedProductIds: string[];
    canWrite: boolean;
    currency: string;
    mode: "purchase" | "return" | "lots";
}) {
    const [lots, setLots] = useState<Lot[]>([]);
    const [returns, setReturns] = useState<SupplierReturn[]>([]);
    const [loading, setLoading] = useState(true);
    const [failed, setFailed] = useState(false);
    const [saving, setSaving] = useState(false);
    const [productId, setProductId] = useState("");
    const [unitId, setUnitId] = useState("");
    const [quantity, setQuantity] = useState("");
    const [quarantined, setQuarantined] = useState("0");
    const [returnLot, setReturnLot] = useState<Lot | null>(null);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [message, setMessage] = useState("");
    const fieldHintId = useId();
    const pending = useRef<{ signature: string; key: string } | null>(null);
    const assignedIds = new Set(assignedProductIds);
    const deliveryProducts = products.filter((product) => product.isActive && assignedIds.has(product._id));
    const selected = deliveryProducts.find((product) => product._id === productId);
    const baseProductUnit = selected?.sellingUnits?.find((unit) => unit.multiplier === 1);
    const baseUnit = baseProductUnit?.unitId.shortForm ?? "base units";
    const deliveryUnit = unitId
        ? selected?.sellingUnits?.find((unit) => unit.unitId._id === unitId)
        : baseProductUnit;
    const received = Number(quantity) * (deliveryUnit?.multiplier ?? 0);
    const held = Number(quarantined);
    const exceedsReceived = Boolean(deliveryUnit && held > received);
    const displayQuantity = (amount: number) => amount.toLocaleString(undefined, { maximumFractionDigits: 6 });
    const pageSize = 10;

    const refresh = useCallback(async () => {
        if (mode === "purchase") return;
        try {
            const [lotResponse, returnResponse] = await Promise.all([
                api.get<{ data: Lot[]; meta: { totalItems: number } }>("/receiving/lots", {
                    params: { supplierId, page, limit: pageSize },
                }),
                mode === "return" ? api.get<{ data: SupplierReturn[] }>("/receiving/returns", {
                    params: { supplierId, limit: 10 },
                }) : null,
            ]);
            setLots(lotResponse.data.data);
            setTotal(lotResponse.data.meta.totalItems);
            setReturns(returnResponse?.data.data ?? []);
            setFailed(false);
        } catch {
            setFailed(true);
        } finally {
            setLoading(false);
        }
    }, [mode, supplierId, page]);

    useEffect(() => {
        void Promise.resolve().then(refresh);
    }, [refresh]);

    function changePage(nextPage: number) {
        setLoading(true);
        setPage(nextPage);
    }

    async function post(path: string, payload: object) {
        const signature = JSON.stringify({ path, payload });
        if (pending.current?.signature !== signature) pending.current = { signature, key: crypto.randomUUID() };
        setSaving(true);
        setMessage("");
        try {
            await api.post(path, { ...payload, requestKey: pending.current.key });
            pending.current = null;
            setMessage(path.endsWith("returns") ? "Supplier return recorded." : "Delivery recorded.");
            if (page === 1) {
                setLoading(true);
                await refresh();
            } else changePage(1);
            return true;
        } catch {
            return false;
        } finally {
            setSaving(false);
        }
    }

    async function receive(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (saving || !baseProductUnit || !deliveryUnit || exceedsReceived) return;
        const form = event.currentTarget;
        const data = new FormData(form);
        const value = (name: string) => String(data.get(name) ?? "").trim();
        if (await post("/receiving/receipts", {
            supplierId,
            currency,
            deliveryReference: value("deliveryReference") || undefined,
            items: [{
                productId,
                unitId: deliveryUnit.unitId._id,
                quantity: Number(value("quantity")),
                quarantinedQuantity: Number(value("quarantinedQuantity")),
                unitCost: value("unitCost"),
                batchNumber: value("batchNumber") || undefined,
                expiresOn: value("expiresOn") || undefined,
            }],
        })) {
            form.reset();
            setProductId("");
            setUnitId("");
            setQuantity("");
            setQuarantined("0");
        }
    }

    async function returnStock(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!returnLot) return;
        const data = new FormData(event.currentTarget);
        if (await post("/receiving/returns", {
            lotId: returnLot._id,
            bucket: data.get("bucket"),
            quantity: Number(data.get("quantity")),
            reason: data.get("reason"),
        })) setReturnLot(null);
    }

    return (
        <section id="receiving" className="scroll-mt-20 space-y-5 rounded-xl border border-border bg-card p-5">
            <h2 className="text-lg font-semibold">{mode === "purchase" ? "Receive delivery" : mode === "return" ? "Choose a lot to return" : "Stock lots"}</h2>
            {canWrite && mode === "purchase" && deliveryProducts.length === 0 && (
                <p className="text-sm text-muted-foreground">This supplier has no active products assigned. Link a product from the supplier’s catalog before recording a delivery.</p>
            )}
            {canWrite && mode === "purchase" && deliveryProducts.length > 0 && (
                <form onSubmit={receive} className="space-y-3">
                    <div className="grid items-start gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <label className="grid gap-1.5 text-sm font-medium">Product received
                            <select name="productId" aria-describedby={`${fieldHintId}-productId`} className={field} value={productId} onChange={(event) => {
                                setProductId(event.target.value);
                                setUnitId("");
                            }} required>
                                <option value="">Select product</option>
                                {deliveryProducts.map((product) => <option key={product._id} value={product._id}>{product.name}</option>)}
                            </select>
                            <span id={`${fieldHintId}-productId`} className={hint}>Choose a product from this supplier’s catalog that appears on the delivery note.</span>
                        </label>
                        <label className="grid gap-1.5 text-sm font-medium">Delivery unit
                            <select className={field} aria-describedby={`${fieldHintId}-unitId`} value={deliveryUnit?.unitId._id ?? ""} onChange={(event) => setUnitId(event.target.value)} disabled={!baseProductUnit} required>
                                <option value="">{selected ? "Select a unit" : "Choose a product first"}</option>
                                {selected?.sellingUnits?.map((unit) => (
                                    <option key={unit._id} value={unit.unitId._id}>
                                        {unit.unitId.name}{unit.multiplier === 1 ? " (base unit)" : ` (1 = ${unit.multiplier} ${baseUnit})`}
                                    </option>
                                ))}
                            </select>
                            <span id={`${fieldHintId}-unitId`} className={hint}>Choose the unit on the supplier’s invoice. Inventory is tracked in {baseUnit}.</span>
                        </label>
                        <label className="grid gap-1.5 text-sm font-medium">Quantity received{deliveryUnit && ` (${deliveryUnit.unitId.shortForm})`}
                            <input className={field} name="quantity" aria-describedby={`${fieldHintId}-quantity`} type="number" min={deliveryUnit?.isFractionable ? "0.001" : "1"} step={deliveryUnit?.isFractionable ? "any" : "1"} placeholder="e.g. 10" value={quantity} onChange={(event) => setQuantity(event.target.value)} required />
                            <span id={`${fieldHintId}-quantity`} className={hint}>Count everything delivered in the selected unit, including damaged stock. For 10 sacks, enter 10.</span>
                        </label>
                        <label className="grid gap-1.5 text-sm font-medium">Cost per {deliveryUnit?.unitId.name ?? "delivery unit"} ({currency})
                            <input className={field} name="unitCost" aria-describedby={`${fieldHintId}-unitCost`} type="text" inputMode="decimal" placeholder="e.g. 250.00" required />
                            <span id={`${fieldHintId}-unitCost`} className={hint}>Enter the cost of one selected unit. If you choose sack, enter the price of one sack.</span>
                        </label>
                        <label className="grid gap-1.5 text-sm font-medium">Stock to hold ({baseUnit})
                            <input className={field} name="quarantinedQuantity" aria-describedby={`${fieldHintId}-quarantinedQuantity`} type="number" min="0" step="any" value={quarantined} onChange={(event) => setQuarantined(event.target.value)} aria-invalid={exceedsReceived || undefined} />
                            <span id={`${fieldHintId}-quarantinedQuantity`} className={hint}>Enter damaged or spoiled stock in the base unit shown above this field. Leave 0 if everything is sellable.</span>
                        </label>
                        <label className="grid gap-1.5 text-sm font-medium">Delivery reference (optional)
                            <input className={field} name="deliveryReference" aria-describedby={`${fieldHintId}-deliveryReference`} placeholder="e.g. DN-1042" maxLength={120} />
                            <span id={`${fieldHintId}-deliveryReference`} className={hint}>Use the number on the supplier’s delivery note or invoice.</span>
                        </label>
                        <label className="grid gap-1.5 text-sm font-medium">Batch number (optional)
                            <input className={field} name="batchNumber" aria-describedby={`${fieldHintId}-batchNumber`} placeholder="e.g. LOT-2026-11" maxLength={100} />
                            <span id={`${fieldHintId}-batchNumber`} className={hint}>Copy the batch or lot number printed on the packaging.</span>
                        </label>
                        <label className="grid gap-1.5 text-sm font-medium">Expiry date (optional)
                            <input className={field} name="expiresOn" aria-describedby={`${fieldHintId}-expiresOn`} type="date" />
                            <span id={`${fieldHintId}-expiresOn`} className={hint}>Use the date printed on this batch. Leave blank if none is shown.</span>
                        </label>
                    </div>
                    {deliveryUnit && received > 0 && (
                        <p role="status" className="rounded-lg bg-brand-50 p-3 text-sm text-link">
                            {displayQuantity(received)} {baseUnit} received · {displayQuantity(Math.max(0, received - held))} sellable · {displayQuantity(held)} on hold
                        </p>
                    )}
                    {selected && !baseProductUnit && <p role="alert" className="text-sm text-red-700">Set up a base unit for this product before recording a delivery.</p>}
                    {exceedsReceived && <p role="alert" className="text-sm text-red-700">Stock on hold cannot exceed the quantity received.</p>}
                    <Button type="submit" disabled={saving || !baseProductUnit || !deliveryUnit || exceedsReceived}>Record delivery</Button>
                </form>
            )}
            {message && <p role="status" className="text-sm text-emerald-700">{message}</p>}
            {mode !== "purchase" && (loading ? <Skeleton role="status" aria-label="Loading stock lots" className="h-24 w-full" /> : failed ? (
                <Button variant="outline" onClick={() => { setLoading(true); void refresh(); }}>Retry loading history</Button>
            ) : (
                <>
                    {lots.length === 0 && <p className="text-sm text-muted-foreground">No deliveries recorded.</p>}
                    <ul className="divide-y">
                        {lots.map((lot) => (
                            <li key={lot._id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                                <div>
                                    <p className="font-medium">{products.find((product) => product._id === lot.productId)?.name ?? lot.productId}</p>
                                    <p className="text-muted-foreground">Receipt {lot.receiptId.slice(-8)} · {lot.sellableQuantity} sellable · {lot.quarantinedQuantity} quarantined{lot.batchNumber && ` · Batch ${lot.batchNumber}`}{lot.expiresOn && ` · Expires ${lot.expiresOn}`}</p>
                                </div>
                                {canWrite && mode === "return" && lot.sellableQuantity + lot.quarantinedQuantity > 0 && (
                                    <Button variant="outline" onClick={() => setReturnLot(lot)} disabled={saving}>Return stock</Button>
                                )}
                            </li>
                        ))}
                    </ul>
                    {total > pageSize && <div className="flex items-center gap-3">
                        <Button variant="outline" disabled={page === 1} onClick={() => changePage(page - 1)}>Previous</Button>
                        <span className="text-sm">Page {page} of {Math.ceil(total / pageSize)}</span>
                        <Button variant="outline" disabled={page * pageSize >= total} onClick={() => changePage(page + 1)}>Next</Button>
                    </div>}
                    {mode === "return" && returns.length > 0 && <div>
                        <h3 className="font-semibold">Recent returns</h3>
                        <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
                            {returns.map((entry) => <li key={entry._id}>{new Date(entry.createdAt).toLocaleDateString()} · Receipt {entry.receiptId.slice(-8)} · {entry.baseQuantity} base units · {entry.reason}</li>)}
                        </ul>
                    </div>}
                </>
            ))}
            {mode === "return" && returnLot && (
                <form key={returnLot._id} onSubmit={returnStock} className="space-y-3 rounded-lg border border-border p-4">
                    <h3 className="font-semibold">Return from receipt {returnLot.receiptId.slice(-8)}</h3>
                    <div className="grid gap-3 sm:grid-cols-3">
                        <label className="grid gap-1 text-sm">Stock condition
                            <select name="bucket" className={field}>
                                {returnLot.quarantinedQuantity > 0 && <option value="quarantined">Quarantined</option>}
                                {returnLot.sellableQuantity > 0 && <option value="sellable">Sellable</option>}
                            </select>
                        </label>
                        <label className="grid gap-1 text-sm">Quantity (base units)<input className={field} name="quantity" type="number" min="0.001" step="any" required /></label>
                        <label className="grid gap-1 text-sm">Reason<input className={field} name="reason" required maxLength={500} /></label>
                    </div>
                    <div className="flex gap-2">
                        <Button type="submit" disabled={saving}>Record return</Button>
                        <Button type="button" variant="outline" disabled={saving} onClick={() => setReturnLot(null)}>Cancel</Button>
                    </div>
                </form>
            )}
        </section>
    );
}
