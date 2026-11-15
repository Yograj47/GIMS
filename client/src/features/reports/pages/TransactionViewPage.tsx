import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Printer, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TransactionData } from "@/types/transaction";
import { useMovementTransactions } from "@/features/MovementTransaction/hooks/useMovementTransactions";
import { BillReceipt } from "@/features/MovementTransaction/components/BillReceipt";
import { SaleBilling } from "../components/SaleBilling";
import { type SalesInvoice } from "@/types/billing";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/api";
import type { ApiResponse } from "@/types/api";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";

export default function TransactionViewPage() {
    const { id } = useParams();
    return <TransactionDetailsRoute key={id} id={id} />;
}

function TransactionDetailsRoute({ id }: { id?: string }) {
    const { state } = useLocation();
    const navigate = useNavigate();
    const initialTransaction = state?.transaction?._id === id ? state?.transaction as TransactionData : undefined;
    const [transaction, setTransaction] = useState(initialTransaction);
    const [loading, setLoading] = useState(Boolean(id && !initialTransaction));

    useEffect(() => {
        if (!id) return;
        let active = true;
        api.get<ApiResponse<TransactionData>>(`/transactions/${id}`).then(
            ({ data }) => { if (active) setTransaction(data.data); },
            () => { /* The API interceptor shows the server error. */ },
        ).finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, [id, initialTransaction]);

    if (loading) return <LoadingSkeleton label="Loading transaction" />;
    if (!transaction) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
                <div className="p-4 bg-muted rounded-full text-slate-300">
                    <XCircle size={48} strokeWidth={1} />
                </div>
                <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs">Transaction Data Missing</p>
                <Button variant="outline" onClick={() => navigate(-1)} className="rounded-xl border-border">Back</Button>
            </div>
        );
    }
    return <TransactionDetails txn={transaction} />;
}

function TransactionDetails({ txn }: { txn: TransactionData }) {
    const [savedCredit, setSavedCredit] = useState<{ isPaid: boolean; notes: string } | null>(null);
    const credit = savedCredit ?? { isPaid: txn.isPaid, notes: txn.notes ?? "" };
    const [draft, setDraft] = useState<typeof credit | null>(null);
    const [invoice, setInvoice] = useState<SalesInvoice | null>(null);
    const user = useAuthStore((state) => state.user);
    const canManageBilling = user?.isVerified &&
        (user.role === "owner" || user.role === "admin" || user.role === "accountant");
    const sale = txn.transactionType === "Sale";
    const { updateCreditStatus, isLoading } = useMovementTransactions();

    return (
        <div className="mx-auto max-w-5xl space-y-4 p-3 sm:p-5 print:p-6">
            <div className="no-print flex flex-wrap justify-end gap-2">
                {canManageBilling && !sale && !draft && (
                    <Button variant="outline" onClick={() => setDraft(credit)}>Update credit status</Button>
                )}
                <Button variant="outline" onClick={() => window.print()}>
                    <Printer aria-hidden="true" /> {invoice ? "Print invoice" : "Print receipt"}
                </Button>
            </div>
            <BillReceipt txn={{ ...txn, ...credit }} invoice={invoice} />
            {canManageBilling && sale && (
                <SaleBilling saleId={txn._id} wasPaid={credit.isPaid} invoice={invoice} onInvoice={setInvoice} />
            )}
            {draft && (
                <form className="no-print space-y-4 rounded-xl border border-border bg-card p-5" onSubmit={async (event) => {
                    event.preventDefault();
                    if (await updateCreditStatus(txn._id, draft)) {
                        setSavedCredit({ ...draft, notes: draft.notes.trim() });
                        setDraft(null);
                    }
                }}>
                    <h2 className="font-semibold">Update credit status</h2>
                    <label className="grid max-w-xs gap-1.5 text-sm">Payment status
                        <select className="rounded-md border border-input p-2" value={draft.isPaid ? "paid" : "unpaid"}
                            onChange={(event) => setDraft({ ...draft, isPaid: event.target.value === "paid" })}>
                            <option value="unpaid">Unpaid</option><option value="paid">Paid</option>
                        </select>
                    </label>
                    <label className="grid gap-1.5 text-sm">Notes
                        <textarea className="rounded-md border border-input bg-card p-2" maxLength={2000} value={draft.notes}
                            onChange={(event) => setDraft({ ...draft, notes: event.target.value })} />
                    </label>
                    <div className="flex gap-2">
                        <Button type="submit" disabled={isLoading}>Save status</Button>
                        <Button type="button" variant="outline" disabled={isLoading} onClick={() => setDraft(null)}>Cancel</Button>
                    </div>
                </form>
            )}
        </div>
    );
}
