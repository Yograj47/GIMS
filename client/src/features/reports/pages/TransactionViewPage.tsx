import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import {
    ArrowLeft, Save, Edit2, Printer, Receipt,
    Calendar, User, CheckCircle2, XCircle, Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Item, TransactionData } from "@/types/transaction";
import { useMovementTransactions } from "@/features/MovementTransaction/hooks/useMovementTransactions";
import { BillReceipt } from "@/features/MovementTransaction/components/BillReceipt";
import { notify } from "@/lib/toast";
import { SaleBilling } from "../components/SaleBilling";
import { formatInvoiceMoney, type SalesInvoice } from "@/types/billing";
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
        if (!id || initialTransaction) return;
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
    const navigate = useNavigate();
    const id = txn._id;
    const [isEditing, setIsEditing] = useState(false);
    const [isPaid, setIsPaid] = useState(txn.isPaid);
    const [notes, setNotes] = useState(txn.notes || "");
    const [invoice, setInvoice] = useState<SalesInvoice | null>(null);
    const user = useAuthStore((state) => state.user);
    const manageBilling = txn.transactionType === "Sale" && user?.isVerified &&
        (user.role === "owner" || user.role === "admin" || user.role === "accountant");
    const paymentCleared = invoice ? invoice.paidMinor === invoice.totalMinor : isPaid;
    const { updateCreditStatus } = useMovementTransactions();

    const handleUpdate = async () => {
        try {
            if (!id) return;
            const success = await updateCreditStatus(id, { isPaid, notes });
            if (success) {
                notify.success("Status Updated");
                setIsEditing(false);
            }
        } catch {
            notify.error("Operation Failed");
        }
    };

    return (
        <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-500 text-foreground">
            {/* 1. COMMAND STRIP HEADER */}
            <div className="no-print space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card px-3 py-3 sm:px-4">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            onClick={() => navigate(-1)}
                            className="h-9 px-0 hover:bg-transparent text-subtle-foreground hover:text-link transition-colors"
                        >
                            <ArrowLeft size={18} aria-hidden="true" />
                        </Button>
                        <div className="h-6 w-px bg-secondary" />
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-subtle-foreground uppercase tracking-[0.2em] leading-none">Record</span>
                            <span className="text-sm font-black text-foreground uppercase">{invoice?.number ?? `TXN-${id?.slice(-6).toUpperCase()}`}</span>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <Button variant="outline" onClick={() => window.print()} className="h-9 rounded-xl gap-2 font-bold text-[11px] uppercase tracking-wider border-input text-muted-foreground hover:bg-muted transition-all">
                            <Printer size={14} className="text-link" /> {invoice ? "Print invoice" : "Print receipt"}
                        </Button>

                        {txn.transactionType !== "Sale" && (!isEditing ? (
                            <Button onClick={() => setIsEditing(true)} className="h-9 bg-brand-600 hover:bg-brand-700 text-white rounded-xl gap-2 font-bold text-[11px] uppercase tracking-wider shadow-sm transition-all">
                                <Edit2 size={14} /> Edit Status
                            </Button>
                        ) : (
                            <div className="flex gap-2 animate-in zoom-in-95 duration-200">
                                <Button variant="ghost" onClick={() => setIsEditing(false)} className="h-9 text-rose-500 font-bold text-[11px] uppercase tracking-wider hover:bg-rose-50  hover:text-rose-600 rounded-xl">
                                    Cancel
                                </Button>
                                <Button onClick={handleUpdate} className="h-9 bg-brand-600 hover:bg-brand-700 text-white rounded-xl gap-2 font-bold text-[11px] uppercase tracking-wider shadow-md transition-all">
                                    <Save size={14} /> Commit Changes
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>

                {manageBilling && (
                    <SaleBilling saleId={txn._id} wasPaid={txn.isPaid} invoice={invoice} onInvoice={setInvoice} />
                )}

                {/* 2. THE AUDIT CARD */}
                <div className="bg-card border border-input rounded-lg shadow-sm overflow-hidden">
                    {/* Brand Header */}
                    <div className="p-8 bg-muted/40 border-b border-border flex justify-between items-end">
                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-brand-600 flex items-center justify-center text-white shadow-lg shadow-brand-100">
                                    <Receipt size={24} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-2xl font-black text-foreground tracking-tighter uppercase">Transaction Voucher</h2>
                                        <Badge className={cn("px-2 py-0.5 rounded-lg border-none font-black text-[9px] uppercase tracking-widest",
                                            txn.transactionType === 'Sale' ? "bg-brand-100 text-link" : "bg-emerald-100 text-emerald-700")}>
                                            {txn.transactionType}
                                        </Badge>
                                    </div>
                                    <p className="text-[10px] font-bold text-subtle-foreground uppercase tracking-widest mt-0.5">Audit-Ready Digital Record</p>
                                </div>
                            </div>

                            <div className="flex gap-8">
                                <div className="space-y-1">
                                    <p className="text-[9px] font-black text-subtle-foreground uppercase tracking-widest">Issuance Date</p>
                                    <p className="text-xs font-bold text-foreground flex items-center gap-2 uppercase">
                                        <Calendar size={12} className="text-link" />
                                        {new Date(txn.createdAt).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </p>
                                </div>
                                <div className="h-8 w-px bg-secondary" />
                                <div className="space-y-1">
                                    <p className="text-[9px] font-black text-subtle-foreground uppercase tracking-widest">Party / Entity</p>
                                    <p className="text-xs font-bold text-foreground flex items-center gap-2 uppercase">
                                        <User size={12} className="text-link" />
                                        {txn.partyDetails?.name || "Walking Customer"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="text-right">
                            <div className="bg-card p-4 px-6 rounded-2xl border border-input inline-block">
                                <p className="text-[9px] font-black text-subtle-foreground uppercase tracking-widest mb-1">Total Valuation</p>
                                <p className="text-3xl font-black text-foreground tabular-nums">
                                    {invoice ? formatInvoiceMoney(invoice.totalMinor, invoice.currency) : `Rs. ${txn.grandTotal?.toLocaleString()}`}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* 3. METADATA SECTION */}
                    <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-3">
                            <h3 className="text-[11px] font-bold text-foreground uppercase flex items-center gap-2">
                                Settlement Status
                            </h3>
                            {isEditing ? (
                                <div className="flex gap-1 p-1.5 bg-secondary rounded-lg w-fit border border-input/50">
                                    <Button
                                        onClick={() => setIsPaid(true)}
                                        className={cn("h-8 rounded-xl font-black text-[11px] uppercase tracking-wider px-6 transition-all", isPaid ? "bg-card text-emerald-600 shadow-sm" : "bg-transparent text-subtle-foreground hover:text-muted-foreground")}
                                    >
                                        Paid
                                    </Button>
                                    <Button
                                        onClick={() => setIsPaid(false)}
                                        className={cn("h-8 rounded-xl font-black text-[11px] uppercase tracking-wider px-6 transition-all", !isPaid ? "bg-card text-rose-600 shadow-sm" : "bg-transparent text-subtle-foreground hover:text-muted-foreground")}
                                    >
                                        Unpaid
                                    </Button>
                                </div>
                            ) : (
                                <div className={cn("inline-flex items-center gap-2 px-4 py-2 rounded-xl font-black text-[11px] uppercase tracking-wider border",
                                    paymentCleared ? "bg-emerald-50/50 text-emerald-700 border-emerald-100" : "bg-rose-50/50 text-rose-700 border-rose-100")}>
                                    {paymentCleared ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                                    {paymentCleared ? "Payment Cleared" : "Outstanding Credit"}
                                </div>
                            )}
                        </div>

                        <div className="space-y-3">
                            <h3 className="text-[11px] font-bold text-foreground uppercase tracking-[0.2em] flex items-center gap-2">
                                Remarks / Notes
                            </h3>
                            {isEditing ? (
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    className="w-full h-20 p-4 rounded-2xl bg-muted border border-border text-sm font-medium focus:ring-1 focus:ring-brand-500 outline-none transition-all placeholder:text-slate-300"
                                    placeholder="Internal auditing notes..."
                                />
                            ) : (
                                <p className="text-xs font-bold text-muted-foreground leading-relaxed italic opacity-80 uppercase tracking-tight">
                                    {notes || "No remarks on file."}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* 4. ITEMIZATION TABLE */}
                    <div className="px-3 pb-6 sm:px-8 sm:pb-10">
                        <div className="overflow-x-auto rounded-lg border border-border">
                            <table aria-label="Transaction items" className="records-table w-full text-sm">
                                <thead>
                                    <tr className="bg-muted text-xs font-semibold text-foreground">
                                        <th className="px-3 py-3 sm:px-5 text-left">Description</th>
                                        <th className="px-3 py-3 sm:px-5 text-center">Qty / Unit</th>
                                        <th className="px-3 py-3 sm:px-5 text-center">Price</th>
                                        <th className="px-3 py-3 sm:px-5 text-right">Line Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {txn.items?.map((item: Item, idx: number) => (
                                        <tr key={idx} data-record className="hover:bg-muted/30 transition-colors">
                                            <td className="px-3 py-3 sm:px-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-muted text-slate-300 flex items-center justify-center border border-border">
                                                        <Package size={14} className="text-link" />
                                                    </div>
                                                    <span className="text-sm font-semibold text-foreground">{item.productName}</span>
                                                </div>
                                            </td>
                                            <td className="px-3 py-3 sm:px-5 text-center">
                                                <span className="text-[11px] font-black text-foreground">
                                                    {item.qty} <span className="text-[9px] text-subtle-foreground ml-0.5 uppercase">{item.unitName?.slice(0,2) || item.unitName}</span>
                                                </span>
                                            </td>
                                            <td className="px-3 py-3 sm:px-5 text-center">
                                                <span className="text-[11px] font-bold text-subtle-foreground italic">Rs. {item.rate?.toLocaleString()}</span>
                                            </td>
                                            <td className="px-3 py-3 sm:px-5 text-right">
                                                <span className="text-xs font-black text-foreground tabular-nums uppercase">
                                                    {invoice?.items[idx] ? formatInvoiceMoney(invoice.items[idx].totalMinor, invoice.currency) : `Rs. ${item.total?.toLocaleString()}`}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
            <BillReceipt txn={txn} invoice={invoice} />
        </div>
    );
}
