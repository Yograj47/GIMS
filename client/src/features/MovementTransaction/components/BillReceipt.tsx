import { useEffect } from "react";
import { useGlobalStore } from "@/store/globalStore";
import type { TransactionData } from "@/types/transaction";
import { formatInvoiceMoney, type SalesInvoice } from "@/types/billing";

export function BillReceipt({ txn, invoice }: { txn: TransactionData; invoice?: SalesInvoice | null }) {
    const { settings, fetchSettings } = useGlobalStore();
    useEffect(() => { void fetchSettings(); }, [fetchSettings]);

    const money = (minor: number) => formatInvoiceMoney(minor, invoice?.currency ?? settings?.currency ?? "NPR");
    const total = invoice?.totalMinor ?? Math.round(txn.grandTotal * 100);
    const outstanding = invoice ? total - invoice.paidMinor : 0;
    const status = invoice ? outstanding === 0 ? "Paid" : invoice.paidMinor > 0 ? "Partially paid" : "Unpaid" : txn.isPaid ? "Paid" : "Unpaid";

    return (
        <article className="overflow-hidden rounded-xl border border-border bg-card print:overflow-visible print:border-0 print:bg-white print:text-black">
            <div className="flex flex-wrap justify-between gap-4 border-b border-border p-5 sm:px-7 print:border-gray-300">
                <div>
                    <p className="text-sm font-medium text-muted-foreground print:text-black">{settings?.storeName || "GroceryPro"}</p>
                    <h1 className="mt-1 text-2xl font-semibold tracking-tight">{invoice ? "Sales invoice" : `${txn.transactionType} receipt`}</h1>
                    {settings?.location && <p className="mt-1 text-sm text-muted-foreground print:text-black">{settings.location}</p>}
                </div>
                <div className="space-y-1 sm:text-right">
                    <p className="font-semibold tabular-nums">{invoice?.number ?? `TXN-${txn._id.slice(-6).toUpperCase()}`}</p>
                    <p className="text-sm text-muted-foreground print:text-black">{new Date(invoice?.createdAt ?? txn.createdAt).toLocaleDateString("en-NP", { dateStyle: "medium" })}</p>
                    <p className="inline-flex rounded-md bg-muted px-2 py-1 text-xs font-medium print:bg-white">{status}</p>
                </div>
            </div>
            <div className="space-y-1 px-5 py-4 sm:px-7">
                <p className="text-sm text-muted-foreground print:text-black">{txn.transactionType === "Sale" ? "Bill to" : "Party"}</p>
                <p className="wrap-anywhere font-medium">{txn.partyDetails?.name || (txn.transactionType === "Sale" ? "Walk-in customer" : "Unspecified")}</p>
                {txn.partyDetails?.phone && <p className="text-sm">{txn.partyDetails.phone}</p>}
            </div>
            <div className="overflow-x-auto print:overflow-visible" role="region" aria-label="Bill items" tabIndex={0}>
                <table className="w-full text-left text-sm">
                    <thead className="border-y border-border bg-muted print:bg-white">
                        <tr>
                            <th scope="col" className="px-4 py-3 sm:pl-7">Item</th>
                            <th scope="col" className="px-3 py-3 text-right">Qty</th>
                            <th scope="col" className="whitespace-nowrap px-3 py-3 text-right">Unit price</th>
                            <th scope="col" className="whitespace-nowrap px-4 py-3 text-right sm:pr-7">Line total</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {txn.items.map((item, index) => {
                            const line = invoice?.items[index];
                            const name = line?.productName && line.productName !== item.productId ? line.productName : item.productName || item.product?.name;
                            const unit = line?.unitName || item.unitName || item.unit?.name;
                            return (
                                <tr key={index} className="break-inside-avoid">
                                    <td className="min-w-28 px-4 py-4 sm:pl-7">
                                        <div className="wrap-anywhere font-medium">{name || `Product #${item.productId.slice(-6).toUpperCase()}`}</div>
                                        <div className="mt-0.5 text-xs text-muted-foreground print:text-black">{unit || "Unit unavailable"}</div>
                                    </td>
                                    <td className="px-3 py-4 text-right tabular-nums">{line?.quantity ?? item.qty}</td>
                                    <td className="whitespace-nowrap px-3 py-4 text-right tabular-nums">{money(line?.rateMinor ?? Math.round(item.rate * 100))}</td>
                                    <td className="whitespace-nowrap px-4 py-4 text-right font-medium tabular-nums sm:pr-7">{money(line?.totalMinor ?? Math.round(item.total * 100))}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            <div className="flex flex-wrap justify-between gap-5 border-t border-border p-5 sm:px-7">
                {txn.notes && <div className="min-w-0 flex-1 basis-40"><p className="text-sm font-medium">Notes</p><p className="mt-1 whitespace-pre-wrap wrap-anywhere text-sm text-muted-foreground print:text-black">{txn.notes}</p></div>}
                <dl className="ml-auto w-full max-w-xs space-y-2 text-sm tabular-nums">
                    <div className="flex justify-between gap-3 font-semibold"><dt>Total</dt><dd>{money(total)}</dd></div>
                    {invoice && <>
                        <div className="flex justify-between gap-3"><dt>Paid</dt><dd>{money(invoice.paidMinor)}</dd></div>
                        <div className="flex justify-between gap-3 border-t border-border pt-2 font-semibold"><dt>Balance due</dt><dd>{money(outstanding)}</dd></div>
                    </>}
                </dl>
            </div>
        </article>
    );
}
