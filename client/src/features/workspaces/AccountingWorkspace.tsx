import { useEffect, useState } from "react";
import { ArrowUpRight, BookOpen, CheckCircle2, ClipboardList, Receipt, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import api from "@/lib/api";

type Receipt = { _id: string; supplierId: string; supplierName: string; deliveryReference?: string };
type Invoice = { _id: string; number: string; transactionId: string };
type Bill = { _id: string; number: string; supplierId: string };
type Queue = { receipts: Receipt[]; unpaidInvoices: Invoice[]; uncostedInvoices: Invoice[]; openBills: Bill[] };

export default function AccountingWorkspace() {
    const [selected, setSelected] = useState<string | null>(null);
    const [queue, setQueue] = useState<Queue>();
    const [failed, setFailed] = useState(false);
    const [attempt, setAttempt] = useState(0);
    useEffect(() => {
        const request = new AbortController();
        api.get<{ data: Queue }>("/billing/work-queue", { signal: request.signal })
            .then(({ data }) => { if (!request.signal.aborted) setQueue(data.data); })
            .catch(() => { if (!request.signal.aborted) setFailed(true); });
        return () => request.abort();
    }, [attempt]);
    const sales = (items: Invoice[]) => items.map((item) => ({ id: item._id, label: item.number, to: `/reports/transaction/${item.transactionId}` }));
    const sections = queue ? [
        { title: "Deliveries to bill", rows: queue.receipts.map((item) => ({ id: item._id, label: item.supplierName + (item.deliveryReference ? ` Â· ${item.deliveryReference}` : ""), to: `/suppliers/v/${item.supplierId}/billing?receiptId=${item._id}` })) },
        { title: "Invoices awaiting payment", rows: sales(queue.unpaidInvoices) },
        { title: "Supplier bills due", rows: queue.openBills.map((item) => ({ id: item._id, label: item.number, to: `/suppliers/v/${item.supplierId}/billing?billId=${item._id}` })) },
        { title: "Sales awaiting inventory cost", rows: sales(queue.uncostedInvoices) },
    ] : [];
    const active = sections.find((section) => section.title === selected)
        ?? sections.find((section) => section.rows.length > 0)
        ?? sections[0];

    return (
        <main className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6 sm:px-6 sm:py-9">
            <header className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-semibold tracking-tight">Accounting</h1>
                    <p className="mt-1 text-sm text-muted-foreground">Post bills, collect payments, and reconcile inventory costs.</p>
                </div>
                <Button asChild><Link to="/reports/accounting"><BookOpen aria-hidden="true" /> Accounting report</Link></Button>
            </header>

            <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_17rem]">
                <section aria-labelledby="worklist-title" className="min-w-0 overflow-hidden rounded-xl border border-border bg-card">
                    <div className="flex items-center gap-3 border-b border-border px-4 py-4 sm:px-5">
                        <ClipboardList aria-hidden="true" className="size-5 text-link" />
                        <h2 id="worklist-title" className="font-semibold">Work queue</h2><span className="ml-auto text-xs text-muted-foreground">Latest 10 per category</span>
                    </div>
                    {failed ? (
                        <div role="alert" className="space-y-3 p-5">
                            <p className="text-sm text-muted-foreground">Could not load the accounting work queue.</p>
                            <Button variant="outline" onClick={() => { setFailed(false); setAttempt((n) => n + 1); }}>Retry</Button>
                        </div>
                    ) : !active ? (
                        <div role="status" aria-label="Loading accounting work queue" className="space-y-3 p-5">
                            <Skeleton className="h-9 w-full" />
                            <Skeleton className="h-28 w-full" />
                        </div>
                    ) : (
                        <>
                            <div role="group" aria-label="Work queue filters" className="flex flex-wrap gap-2 border-b border-border p-3 sm:px-5">
                                {sections.map(({ title, rows }) => (
                                    <Button key={title} type="button" size="sm" variant={title === active.title ? "secondary" : "ghost"}
                                        aria-pressed={title === active.title} onClick={() => setSelected(title)} className="h-auto min-h-9 whitespace-normal text-left">
                                        {title}
                                        <span className="rounded-md bg-background px-1.5 text-xs tabular-nums">{rows.length}</span>
                                    </Button>
                                ))}
                            </div>
                            <div aria-live="polite">
                                {active.rows.length ? (
                                    <ul className="divide-y divide-border">
                                        {active.rows.map((row) => (
                                            <li key={row.id}>
                                                <Link to={row.to} className="flex items-center justify-between gap-3 px-4 py-3 text-sm font-medium hover:bg-accent sm:px-5">
                                                    <span className="wrap-anywhere">{row.label}</span>
                                                    <ArrowUpRight aria-hidden="true" className="size-4 shrink-0 text-link" />
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className="grid min-h-36 place-content-center justify-items-center gap-2 px-4 py-6 text-center">
                                        <CheckCircle2 aria-hidden="true" className="size-6 text-link" />
                                        <p className="text-sm font-medium">Nothing pending for this filter</p>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </section>

                <nav aria-label="Billing shortcuts" className="overflow-hidden rounded-xl border border-border bg-card">
                    <h2 className="border-b border-border px-4 py-4 font-semibold">Billing</h2>
                    <div className="divide-y divide-border">
                        <Link to="/reports/transactions" className="flex min-h-12 items-center gap-3 px-4 py-3 text-sm font-medium hover:bg-accent">
                            <Receipt aria-hidden="true" className="size-4 text-link" /> Sales and invoices
                        </Link>
                        <Link to="/suppliers" className="flex min-h-12 items-center gap-3 px-4 py-3 text-sm font-medium hover:bg-accent">
                            <Truck aria-hidden="true" className="size-4 text-link" /> Supplier billing
                        </Link>
                    </div>
                </nav>
            </div>
        </main>
    );
}
