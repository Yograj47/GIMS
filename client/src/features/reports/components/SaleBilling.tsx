import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { isAxiosError } from "axios";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import api from "@/lib/api";
import type { ApiResponse } from "@/types/api";
import { formatInvoiceMoney, parseMinorAmount, type SalesInvoice } from "@/types/billing";

export function SaleBilling({ saleId, wasPaid, invoice, onInvoice }: {
    saleId: string;
    wasPaid: boolean;
    invoice: SalesInvoice | null;
    onInvoice: (invoice: SalesInvoice | null) => void;
}) {
    const [loading, setLoading] = useState(true);
    const [failed, setFailed] = useState(false);
    const [saving, setSaving] = useState(false);
    const [amount, setAmount] = useState("");
    const [method, setMethod] = useState("cash");
    const [reference, setReference] = useState("");
    const [error, setError] = useState("");
    const [costError, setCostError] = useState("");
    const pendingKey = useRef<{ signature: string; key: string } | null>(null);
    const url = `/billing/sales/${saleId}/invoice`;

    useEffect(() => {
        let active = true;
        api.get<ApiResponse<SalesInvoice | null>>(url).then(
            ({ data }) => { if (active) onInvoice(data.data ?? null); },
            () => { if (active) setFailed(true); },
        ).finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, [url, onInvoice]);

    async function issue() {
        setSaving(true);
        try {
            const { data } = await api.post<ApiResponse<SalesInvoice>>(url);
            onInvoice(data.data ?? null);
        } catch {
            // The API interceptor shows the server error.
        } finally {
            setSaving(false);
        }
    }

    async function pay(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!invoice || saving) return;
        setError("");
        const amountMinor = parseMinorAmount(amount);
        if (amountMinor === null || amountMinor > invoice.totalMinor - invoice.paidMinor) {
            setError("Enter a positive amount up to the outstanding balance, with up to two decimal places.");
            return;
        }
        const payment = { amountMinor, method, reference: reference.trim() || undefined };
        const signature = JSON.stringify(payment);
        if (pendingKey.current?.signature !== signature) {
            pendingKey.current = { signature, key: crypto.randomUUID() };
        }
        setSaving(true);
        try {
            await api.post(`/billing/invoices/${invoice._id}/payments`, {
                ...payment, requestKey: pendingKey.current.key,
            });
            const { data } = await api.get<ApiResponse<SalesInvoice>>(url);
            onInvoice(data.data ?? null);
            pendingKey.current = null;
            setAmount("");
            setReference("");
        } catch {
            // Retain the request key so a retry cannot record the payment twice.
        } finally {
            setSaving(false);
        }
    }

    async function postCost() {
        if (!invoice) return;
        setCostError("");
        setSaving(true);
        try {
            const { data } = await api.post<ApiResponse<SalesInvoice>>(`/billing/invoices/${invoice._id}/cost`);
            onInvoice(data.data ?? invoice);
        } catch (error) {
            setCostError(isAxiosError<{ message?: string }>(error)
                ? error.response?.data?.message ?? "Inventory cost could not be posted."
                : "Inventory cost could not be posted.");
        } finally {
            setSaving(false);
        }
    }

    const outstanding = invoice ? invoice.totalMinor - invoice.paidMinor : 0;
    return (
        <section className="no-print space-y-4 rounded-lg border border-border bg-card p-5">
            <h2 className="text-base font-bold">{invoice?.number ?? "Sales invoice"}</h2>
            {loading ? <Skeleton role="status" aria-label="Loading invoice" className="h-10 w-full" />
                : failed ? <p className="text-sm text-muted-foreground">Invoice details could not be loaded. Refresh to try again.</p>
                : !invoice ? (
                    wasPaid ? <p className="text-sm text-muted-foreground">This sale was already marked paid and requires reconciliation.</p>
                        : <Button onClick={issue} disabled={saving}>{saving ? "Issuing…" : "Issue invoice"}</Button>
                ) : (
                    <>
                        <dl className="grid grid-cols-3 gap-3 text-sm">
                            {([["Total", invoice.totalMinor], ["Paid", invoice.paidMinor], ["Due", outstanding]] as const).map(([label, value]) => (
                                <div key={label}>
                                    <dt className="text-muted-foreground">{label}</dt>
                                    <dd className="font-semibold tabular-nums">{formatInvoiceMoney(value, invoice.currency)}</dd>
                                </div>
                            ))}
                        </dl>
                        {invoice.costMinor === undefined ? (
                            <Button variant="outline" disabled={saving} onClick={() => void postCost()}>Post inventory cost</Button>
                        ) : <p className="text-sm">Inventory cost {formatInvoiceMoney(invoice.costMinor, invoice.currency)}</p>}
                        {costError && <p role="alert" className="text-sm text-red-700">{costError}</p>}
                        {outstanding > 0 && (
                            <form onSubmit={pay} className="flex flex-wrap items-end gap-3">
                                <label className="grid gap-1 text-sm">Amount (NPR)
                                    <input className="rounded-md border px-3 py-2" value={amount} onChange={(event) => setAmount(event.target.value)} inputMode="decimal" required disabled={saving} />
                                </label>
                                <label className="grid gap-1 text-sm">Method
                                    <select className="rounded-md border px-3 py-2" value={method} onChange={(event) => setMethod(event.target.value)} disabled={saving}>
                                        <option value="cash">Cash</option>
                                        <option value="bank">Bank transfer</option>
                                    </select>
                                </label>
                                <label className="grid gap-1 text-sm">Reference (optional)
                                    <input className="rounded-md border px-3 py-2" value={reference} onChange={(event) => setReference(event.target.value)} maxLength={120} disabled={saving} />
                                </label>
                                <Button type="submit" disabled={saving}>{saving ? "Recording…" : "Record payment"}</Button>
                                {error && <p role="alert" className="w-full text-sm text-red-700">{error}</p>}
                            </form>
                        )}
                    </>
                )}
        </section>
    );
}
