import { useCallback, useEffect, useRef, useState } from "react";
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

const field = "min-w-0 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm";

export function SupplierReceiving({ supplierId, products, canWrite, currency }: {
    supplierId: string;
    products: ProductData[];
    canWrite: boolean;
    currency: string;
}) {
    const [lots, setLots] = useState<Lot[]>([]);
    const [returns, setReturns] = useState<SupplierReturn[]>([]);
    const [loading, setLoading] = useState(true);
    const [failed, setFailed] = useState(false);
    const [saving, setSaving] = useState(false);
    const [productId, setProductId] = useState("");
    const [returnLot, setReturnLot] = useState<Lot | null>(null);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [message, setMessage] = useState("");
    const pending = useRef<{ signature: string; key: string } | null>(null);
    const selected = products.find((product) => product._id === productId);
    const pageSize = 10;

    const refresh = useCallback(async () => {
        try {
            const [lotResponse, returnResponse] = await Promise.all([
                api.get<{ data: Lot[]; meta: { totalItems: number } }>("/receiving/lots", {
                    params: { supplierId, page, limit: pageSize },
                }),
                api.get<{ data: SupplierReturn[] }>("/receiving/returns", {
                    params: { supplierId, limit: 10 },
                }),
            ]);
            setLots(lotResponse.data.data);
            setTotal(lotResponse.data.meta.totalItems);
            setReturns(returnResponse.data.data);
            setFailed(false);
        } catch {
            setFailed(true);
        } finally {
            setLoading(false);
        }
    }, [supplierId, page]);

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
        const form = event.currentTarget;
        const data = new FormData(form);
        const value = (name: string) => String(data.get(name) ?? "").trim();
        if (await post("/receiving/receipts", {
            supplierId,
            currency,
            deliveryReference: value("deliveryReference") || undefined,
            items: [{
                productId,
                unitId: value("unitId"),
                quantity: Number(value("quantity")),
                quarantinedQuantity: Number(value("quarantinedQuantity")),
                unitCost: value("unitCost"),
                batchNumber: value("batchNumber") || undefined,
                expiresOn: value("expiresOn") || undefined,
            }],
        })) {
            form.reset();
            setProductId("");
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
        <section className="space-y-5 rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="text-lg font-semibold">Receiving and returns</h2>
            {canWrite && (
                <form onSubmit={receive} className="space-y-3">
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        <label className="grid gap-1 text-sm">Product
                            <select name="productId" className={field} value={productId} onChange={(event) => setProductId(event.target.value)} required>
                                <option value="">Select product</option>
                                {products.filter((product) => product.isActive).map((product) => <option key={product._id} value={product._id}>{product.name}</option>)}
                            </select>
                        </label>
                        <label className="grid gap-1 text-sm">Unit
                            <select key={productId} className={field} name="unitId" required>
                                <option value="">Select unit</option>
                                {selected?.sellingUnits?.map((unit) => <option key={unit._id} value={unit.unitId._id}>{unit.unitId.name} × {unit.multiplier}</option>)}
                            </select>
                        </label>
                        <label className="grid gap-1 text-sm">Received quantity<input className={field} name="quantity" type="number" min="0.001" step="any" required /></label>
                        <label className="grid gap-1 text-sm">Cost per selected unit ({currency})<input className={field} name="unitCost" type="text" inputMode="decimal" required /></label>
                        <label className="grid gap-1 text-sm">Quarantined (base units)<input className={field} name="quarantinedQuantity" type="number" min="0" step="any" defaultValue="0" /></label>
                        <label className="grid gap-1 text-sm">Delivery reference<input className={field} name="deliveryReference" maxLength={120} /></label>
                        <label className="grid gap-1 text-sm">Batch number<input className={field} name="batchNumber" maxLength={100} /></label>
                        <label className="grid gap-1 text-sm">Expiry date<input className={field} name="expiresOn" type="date" /></label>
                    </div>
                    <Button type="submit" disabled={saving}>Record delivery</Button>
                </form>
            )}
            {message && <p role="status" className="text-sm text-emerald-700">{message}</p>}
            {loading ? <Skeleton role="status" aria-label="Loading stock lots" className="h-24 w-full" /> : failed ? (
                <Button variant="outline" onClick={() => { setLoading(true); void refresh(); }}>Retry loading history</Button>
            ) : (
                <>
                    <h3 className="font-semibold">Stock lots</h3>
                    {lots.length === 0 && <p className="text-sm text-slate-600">No deliveries recorded.</p>}
                    <ul className="divide-y">
                        {lots.map((lot) => (
                            <li key={lot._id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                                <div>
                                    <p className="font-medium">{products.find((product) => product._id === lot.productId)?.name ?? lot.productId}</p>
                                    <p className="text-slate-600">Receipt {lot.receiptId.slice(-8)} · {lot.sellableQuantity} sellable · {lot.quarantinedQuantity} quarantined{lot.batchNumber && ` · Batch ${lot.batchNumber}`}{lot.expiresOn && ` · Expires ${lot.expiresOn}`}</p>
                                </div>
                                {canWrite && lot.sellableQuantity + lot.quarantinedQuantity > 0 && (
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
                    {returns.length > 0 && <div>
                        <h3 className="font-semibold">Recent returns</h3>
                        <ul className="mt-2 space-y-2 text-sm text-slate-600">
                            {returns.map((entry) => <li key={entry._id}>{new Date(entry.createdAt).toLocaleDateString()} · Receipt {entry.receiptId.slice(-8)} · {entry.baseQuantity} base units · {entry.reason}</li>)}
                        </ul>
                    </div>}
                </>
            )}
            {returnLot && (
                <form key={returnLot._id} onSubmit={returnStock} className="space-y-3 rounded-lg border border-slate-200 p-4">
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
