import { useRef, useState } from "react";
import type { FormEvent } from "react";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import type { ProductData } from "@/types/product";

interface StockBalance {
    productId: string;
    systemSellable: number;
    stockRevision: number;
    trackedSellable: number;
    unattributedSellable: number;
    quarantined: number;
    excessTracked: number;
}

const field = "rounded-md border border-slate-300 px-3 py-2 text-sm";

export function StockReconciliation({ products, canWrite, onCount }: {
    products: ProductData[];
    canWrite: boolean;
    onCount: () => Promise<unknown>;
}) {
    const [productId, setProductId] = useState("");
    const [balance, setBalance] = useState<StockBalance | null>(null);
    const [busy, setBusy] = useState(false);
    const [message, setMessage] = useState("");
    const pending = useRef<{ signature: string; key: string } | null>(null);

    async function read(id: string) {
        const { data } = await api.get<{ data: StockBalance }>(`/receiving/stock/${id}`);
        setBalance(data.data);
    }

    async function select(id: string) {
        setProductId(id);
        setBalance(null);
        setMessage("");
        if (!id) return;
        setBusy(true);
        try {
            await read(id);
        } catch {
            setMessage("The balance could not be loaded. Select the product again to retry.");
        } finally {
            setBusy(false);
        }
    }

    async function record(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!balance || busy) return;
        const form = event.currentTarget;
        const data = new FormData(form);
        const payload = {
            expectedQuantity: balance.systemSellable,
            expectedRevision: balance.stockRevision,
            countedQuantity: Number(data.get("quantity")),
            reason: String(data.get("reason")).trim(),
        };
        const signature = JSON.stringify({ productId, payload });
        if (pending.current?.signature !== signature) pending.current = { signature, key: crypto.randomUUID() };
        setBusy(true);
        setMessage("");
        try {
            await api.post(`/receiving/stock/${productId}/count`, { ...payload, requestKey: pending.current.key });
            pending.current = null;
            form.reset();
            setMessage("Stock count recorded.");
            await Promise.all([read(productId), onCount()]);
        } catch {
            // The API displays the validation or concurrency error.
        } finally {
            setBusy(false);
        }
    }

    return (
        <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="text-lg font-semibold">Stock reconciliation</h2>
            <div className="flex flex-wrap items-end gap-3">
                <label className="grid gap-1 text-sm">Product
                    <select className={field} value={productId} onChange={(event) => void select(event.target.value)} disabled={busy}>
                        <option value="">Select a product from the report</option>
                        {products.map((product) => <option key={product._id} value={product._id}>{product.name}</option>)}
                    </select>
                </label>
                <Button variant="outline" disabled={!productId || busy} onClick={() => void select(productId)}>Refresh balance</Button>
            </div>
            {message && <p role="status" className="text-sm">{message}</p>}
            {balance && (
                <>
                    <dl className="grid grid-cols-2 gap-3 text-sm lg:grid-cols-4">
                        {([
                            ["System sellable", balance.systemSellable],
                            ["Sellable in supplier lots", balance.trackedSellable],
                            ["Sellable without a known lot", balance.unattributedSellable],
                            ["Quarantined", balance.quarantined],
                        ] as const).map(([label, value]) => (
                            <div key={label} className="rounded-md bg-slate-50 p-3">
                                <dt className="text-slate-600">{label}</dt>
                                <dd className="font-semibold tabular-nums">{value}</dd>
                            </div>
                        ))}
                    </dl>
                    {balance.excessTracked > 1e-8 && <p role="alert" className="text-sm text-red-700">Tracked lots exceed the system balance by {balance.excessTracked} base units.</p>}
                    {canWrite && balance.excessTracked <= 1e-8 && (
                        <form onSubmit={record} className="flex flex-wrap items-end gap-3">
                            <label className="grid gap-1 text-sm">Counted sellable (base units)
                                <input className={field} name="quantity" type="number" min="0" step="any" required disabled={busy} />
                            </label>
                            <label className="grid gap-1 text-sm">Adjustment reason
                                <input className={field} name="reason" maxLength={500} required disabled={busy} />
                            </label>
                            <Button type="submit" disabled={busy}>Record stock count</Button>
                        </form>
                    )}
                </>
            )}
        </section>
    );
}
