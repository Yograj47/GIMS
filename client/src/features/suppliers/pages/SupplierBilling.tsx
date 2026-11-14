import { BackButton } from "@/components/common/BackButton";
import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import api from "@/lib/api";
import { formatInvoiceMoney, parseMinorAmount } from "@/types/billing";

type Bill = { _id: string; number: string; receiptId: string; totalMinor: number; creditedMinor: number; paidMinor: number; currency: string };
type Receipt = { _id: string; deliveryReference?: string; createdAt: string };
type Return = { _id: string; receiptId: string; reason: string; baseQuantity: number };
type Page<T> = { data: T[]; meta: { totalItems: number } };
const field = "min-w-0 rounded-md border border-input px-3 py-2 text-sm";
const limit = 25;

export default function SupplierBilling() {
    const { id } = useParams();
    const [params] = useSearchParams();
    const receipt = params.get("receiptId") || "";
    const bill = params.get("billId") || "";
    return <SupplierBillingPage key={`${id}:${receipt}:${bill}`} supplierId={id!} initialReceipt={receipt} initialBill={bill} />;
}

function SupplierBillingPage({ supplierId, initialReceipt, initialBill }: { supplierId: string; initialReceipt: string; initialBill: string }) {
    const [bills, setBills] = useState<Bill[]>([]);
    const [receipts, setReceipts] = useState<Receipt[]>([]);
    const [returns, setReturns] = useState<Return[]>([]);
    const [billId, setBillId] = useState(initialBill);
    const [billPage, setBillPage] = useState(1);
    const [receiptPage, setReceiptPage] = useState(1);
    const [returnPage, setReturnPage] = useState(1);
    const [totals, setTotals] = useState({ bills: 0, receipts: 0, returns: 0 });
    const [reload, setReload] = useState(0);
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const paymentKey = useRef<{ signature: string; key: string } | null>(null);
    const bill = bills.find((item) => item._id === billId);
    const due = bill ? bill.totalMinor - bill.creditedMinor - bill.paidMinor : 0;

    useEffect(() => {
        let active = true;
        Promise.all([
            api.get<Page<Bill>>(`/billing/suppliers/${supplierId}/bills`, { params: { page: billPage, billId: initialBill || undefined } }),
            api.get<Page<Receipt>>("/receiving/receipts", { params: { supplierId, page: receiptPage, limit, receiptId: initialReceipt || undefined } }),
            billId
                ? api.get<Page<Return>>("/receiving/returns", { params: { supplierId, receiptId: bill?.receiptId, page: returnPage, limit } })
                : Promise.resolve(null),
        ]).then(([billResponse, receiptResponse, returnResponse]) => {
            if (!active) return;
            setBills(billResponse.data.data);
            setReceipts(receiptResponse.data.data);
            setReturns(returnResponse?.data.data ?? []);
            setTotals({
                bills: billResponse.data.meta.totalItems,
                receipts: receiptResponse.data.meta.totalItems,
                returns: returnResponse?.data.meta.totalItems ?? 0,
            });
        }).catch(() => { if (active) setError("Could not load supplier billing records."); })
            .finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, [supplierId, initialBill, initialReceipt, billPage, receiptPage, returnPage, reload, billId, bill?.receiptId]);

    async function submit(event: FormEvent<HTMLFormElement>, action: "bill" | "credit" | "payment") {
        event.preventDefault();
        if (busy) return;
        const form = event.currentTarget;
        const fields = new FormData(form);
        const value = (name: string) => String(fields.get(name) ?? "").trim();
        setError("");
        setMessage("");
        setBusy(true);
        try {
            if (action === "bill") {
                await api.post("/billing/supplier-bills", { receiptId: value("receiptId"), number: value("number") });
                setBillPage(1);
            } else if (action === "credit") {
                await api.post(`/billing/supplier-bills/${billId}/credits`, { returnId: value("returnId"), reference: value("reference") });
            } else {
                const amountMinor = parseMinorAmount(value("amount"));
                if (amountMinor === null || amountMinor > due) {
                    setError("Enter a positive amount up to the balance due.");
                    return;
                }
                const payload = { amountMinor, method: value("method"), reference: value("reference") || undefined };
                const signature = JSON.stringify({ billId, payload });
                if (paymentKey.current?.signature !== signature) paymentKey.current = { signature, key: crypto.randomUUID() };
                await api.post(`/billing/supplier-bills/${billId}/payments`, { ...payload, requestKey: paymentKey.current.key });
                paymentKey.current = null;
            }
            form.reset();
            setMessage(action === "bill" ? "Supplier bill posted." : action === "credit" ? "Supplier credit posted." : "Supplier payment recorded.");
            setReload((previous) => previous + 1);
        } catch {
            // The API interceptor shows the server response.
        } finally {
            setBusy(false);
        }
    }

    const pageControls = (page: number, total: number, select: (page: number) => void, label: string) => total > limit && (
        <div className="flex items-center gap-2 text-sm" aria-label={label}>
            <Button type="button" variant="outline" size="sm" disabled={page === 1} onClick={() => select(page - 1)}>Previous</Button>
            <span>{page} / {Math.ceil(total / limit)}</span>
            <Button type="button" variant="outline" size="sm" disabled={page * limit >= total} onClick={() => select(page + 1)}>Next</Button>
        </div>
    );

    return (
        <div className="mx-auto w-full max-w-6xl space-y-7 px-4 py-7 sm:px-6 sm:py-10">
            <BackButton className="text-sm text-link hover:underline" />
            <h1 className="text-xl font-bold">Supplier billing</h1>
            {message && <p role="status" className="text-sm text-emerald-700">{message}</p>}
            {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
            {loading ? <Skeleton role="status" aria-label="Loading supplier bills" className="h-24 w-full" /> : (
                <>
                    <form onSubmit={(event) => void submit(event, "bill")} className="space-y-5 rounded-xl border border-border bg-card p-5 sm:p-6">
                        <h2 className="font-semibold">Post supplier bill</h2>
                        <div className="flex flex-wrap items-end gap-3">
                            <label className="grid gap-1 text-sm">Goods receipt
                                <select name="receiptId" className={field} defaultValue={initialReceipt} required>
                                    <option value="">Select receipt</option>
                                    {receipts.map((receipt) => <option key={receipt._id} value={receipt._id}>{receipt.deliveryReference || receipt._id.slice(-8)} · {new Date(receipt.createdAt).toLocaleDateString()}</option>)}
                                </select>
                            </label>
                            <label className="grid gap-1 text-sm">Supplier invoice number
                                <input className={field} name="number" placeholder="e.g. INV-1042" aria-describedby="supplier-invoice-number-help" maxLength={120} required />
                            </label>
                            <Button type="submit" disabled={busy || receipts.length === 0}>Post bill</Button>
                        </div>
                        <p id="supplier-invoice-number-help" className="text-sm text-muted-foreground">
                            Copy the invoice or bill number printed on the supplier’s invoice for this delivery.
                        </p>
                        {pageControls(receiptPage, totals.receipts, setReceiptPage, "Receipt pages")}
                    </form>
                    <section className="space-y-5 rounded-xl border border-border bg-card p-5 sm:p-6">
                        <h2 className="font-semibold">Supplier bills</h2>
                        <label className="grid max-w-sm gap-1 text-sm">Bill
                            <select className={field} value={billId} disabled={busy} onChange={(event) => { setBillId(event.target.value); setReturnPage(1); }}>
                                <option value="">Select bill</option>
                                {bills.map((item) => <option key={item._id} value={item._id}>{item.number}</option>)}
                            </select>
                        </label>
                        {pageControls(billPage, totals.bills, (page) => { setBillId(""); setBillPage(page); }, "Bill pages")}
                        {bill && (
                            <>
                                <dl className="grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
                                    {([["Total", bill.totalMinor], ["Credited", bill.creditedMinor], ["Paid", bill.paidMinor], ["Due", due]] as const).map(([label, amount]) => (
                                        <div key={label}><dt className="text-muted-foreground">{label}</dt><dd className="font-semibold">{formatInvoiceMoney(amount, bill.currency)}</dd></div>
                                    ))}
                                </dl>
                                {due > 0 && (
                                    <div className="grid gap-4 lg:grid-cols-2">
                                        <form key={`credit-${billId}`} onSubmit={(event) => void submit(event, "credit")} className="grid content-start gap-2 rounded-md border p-3">
                                            <h3 className="font-semibold">Record supplier credit</h3>
                                            <label className="grid gap-1 text-sm">Supplier return
                                                <select name="returnId" className={field} required>
                                                    <option value="">Select return</option>
                                                    {returns.filter((item) => item.receiptId === bill.receiptId).map((item) => <option key={item._id} value={item._id}>{item.reason} · {item.baseQuantity} units · {item._id.slice(-8)}</option>)}
                                                </select>
                                            </label>
                                            {pageControls(returnPage, totals.returns, setReturnPage, "Return pages")}
                                            <label className="grid gap-1 text-sm">Credit reference<input className={field} name="reference" maxLength={120} required /></label>
                                            <Button type="submit" disabled={busy || !returns.some((item) => item.receiptId === bill.receiptId)}>Post credit</Button>
                                        </form>
                                        <form key={`payment-${billId}`} onSubmit={(event) => void submit(event, "payment")} className="grid content-start gap-2 rounded-md border p-3">
                                            <h3 className="font-semibold">Record supplier payment</h3>
                                            <label className="grid gap-1 text-sm">Amount (NPR)<input className={field} name="amount" inputMode="decimal" required /></label>
                                            <label className="grid gap-1 text-sm">Method<select className={field} name="method"><option value="cash">Cash</option><option value="bank">Bank transfer</option></select></label>
                                            <label className="grid gap-1 text-sm">Reference<input className={field} name="reference" maxLength={120} /></label>
                                            <Button type="submit" disabled={busy}>Record payment</Button>
                                        </form>
                                    </div>
                                )}
                            </>
                        )}
                    </section>
                </>
            )}
        </div>
    );
}
