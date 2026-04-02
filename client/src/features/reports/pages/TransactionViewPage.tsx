import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import {
    ArrowLeft, Save, Edit2, Printer, Receipt,
    Calendar, User, CheckCircle2, XCircle, Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { TransactionData } from "@/types/Transaction";
import { useMovementTransactions } from "@/features/MovementTransaction/hooks/useMovementTransactions";
import { BillReceipt } from "@/features/MovementTransaction/components/BillReceipt";

export default function TransactionViewPage() {
    const { state } = useLocation();
    const navigate = useNavigate();
    const { id } = useParams();

    const txn: TransactionData = state?.transaction;

    const [isEditing, setIsEditing] = useState(false);
    const [isPaid, setIsPaid] = useState(txn?.isPaid);
    const [notes, setNotes] = useState(txn?.notes || "");
    const { updateCreditStatus } = useMovementTransactions();

    if (!txn) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
                <div className="p-4 bg-slate-50 rounded-full text-slate-300">
                    <XCircle size={48} strokeWidth={1} />
                </div>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Transaction Data Missing</p>
                <Button variant="outline" onClick={() => navigate("/reports/transactions")} className="rounded-xl border-slate-200">Return to List</Button>
            </div>
        );
    }

    const handleUpdate = async () => {
        try {
            if (!id) return;
            const success = await updateCreditStatus(id, { isPaid, notes });
            if (success) {
                toast.success("Status Updated");
                setIsEditing(false);
            }
        } catch (error) {
            toast.error("Update Failed");
        }
    };

    return (
        <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-500 text-slate-900">
            {/* 1. COMMAND STRIP HEADER */}
            <div className="no-print space-y-6">
                <div className="flex justify-between items-center rounded-lg bg-white h-14 px-4 border border-slate-300 ">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            onClick={() => navigate(-1)}
                            className="h-9 px-0 hover:bg-transparent text-slate-400 hover:text-blue-600 transition-colors"
                        >
                            <ArrowLeft size={18} />
                        </Button>
                        <div className="h-6 w-px bg-slate-100" />
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none">Record</span>
                            <span className="text-sm font-black text-slate-900 uppercase">INV-{id?.slice(-6).toUpperCase()}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={() => window.print()} className="h-9 rounded-xl gap-2 font-bold text-[11px] uppercase tracking-wider border-slate-300 text-slate-600 hover:bg-slate-50 transition-all">
                            <Printer size={14} className="text-blue-600" /> Print Bill
                        </Button>

                        {!isEditing ? (
                            <Button onClick={() => setIsEditing(true)} className="h-9 bg-blue-600 hover:bg-blue-700 text-white rounded-xl gap-2 font-bold text-[11px] uppercase tracking-wider shadow-sm transition-all">
                                <Edit2 size={14} /> Edit Status
                            </Button>
                        ) : (
                            <div className="flex gap-2 animate-in zoom-in-95 duration-200">
                                <Button variant="ghost" onClick={() => setIsEditing(false)} className="h-9 text-rose-500 font-bold text-[11px] uppercase tracking-wider hover:bg-rose-50  hover:text-rose-600 rounded-xl">
                                    Cancel
                                </Button>
                                <Button onClick={handleUpdate} className="h-9 bg-blue-600 hover:bg-blue-700 text-white rounded-xl gap-2 font-bold text-[11px] uppercase tracking-wider shadow-md transition-all">
                                    <Save size={14} /> Commit Changes
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                {/* 2. THE AUDIT CARD */}
                <div className="bg-white border border-slate-300 rounded-lg shadow-sm overflow-hidden">
                    {/* Brand Header */}
                    <div className="p-8 bg-slate-50/40 border-b border-slate-100 flex justify-between items-end">
                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-100">
                                    <Receipt size={24} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Transaction Voucher</h2>
                                        <Badge className={cn("px-2 py-0.5 rounded-lg border-none font-black text-[9px] uppercase tracking-widest",
                                            txn.transactionType === 'Sale' ? "bg-blue-100 text-blue-700" : "bg-emerald-100 text-emerald-700")}>
                                            {txn.transactionType}
                                        </Badge>
                                    </div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Audit-Ready Digital Record</p>
                                </div>
                            </div>

                            <div className="flex gap-8">
                                <div className="space-y-1">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Issuance Date</p>
                                    <p className="text-xs font-bold text-slate-700 flex items-center gap-2 uppercase">
                                        <Calendar size={12} className="text-blue-600" />
                                        {new Date(txn.createdAt).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </p>
                                </div>
                                <div className="h-8 w-px bg-slate-200" />
                                <div className="space-y-1">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Party / Entity</p>
                                    <p className="text-xs font-bold text-slate-700 flex items-center gap-2 uppercase">
                                        <User size={12} className="text-blue-600" />
                                        {txn.partyDetails?.name || "Walking Customer"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="text-right">
                            <div className="bg-white p-4 px-6 rounded-2xl border border-slate-300 inline-block">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Valuation</p>
                                <p className="text-3xl font-black text-slate-900 tabular-nums">
                                    <span className="text-sm mr-1 text-slate-300 font-bold uppercase">Rs</span>
                                    {txn.grandTotal?.toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* 3. METADATA SECTION */}
                    <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-3">
                            <h3 className="text-[11px] font-bold text-slate-900 uppercase flex items-center gap-2">
                                Settlement Status
                            </h3>
                            {isEditing ? (
                                <div className="flex gap-1 p-1.5 bg-slate-100 rounded-lg w-fit border border-slate-300/50">
                                    <Button
                                        onClick={() => setIsPaid(true)}
                                        className={cn("h-8 rounded-xl font-black text-[11px] uppercase tracking-wider px-6 transition-all", isPaid ? "bg-white text-emerald-600 shadow-sm" : "bg-transparent text-slate-400 hover:text-slate-600")}
                                    >
                                        Paid
                                    </Button>
                                    <Button
                                        onClick={() => setIsPaid(false)}
                                        className={cn("h-8 rounded-xl font-black text-[11px] uppercase tracking-wider px-6 transition-all", !isPaid ? "bg-white text-rose-600 shadow-sm" : "bg-transparent text-slate-400 hover:text-slate-600")}
                                    >
                                        Unpaid
                                    </Button>
                                </div>
                            ) : (
                                <div className={cn("inline-flex items-center gap-2 px-4 py-2 rounded-xl font-black text-[11px] uppercase tracking-wider border",
                                    isPaid ? "bg-emerald-50/50 text-emerald-700 border-emerald-100" : "bg-rose-50/50 text-rose-700 border-rose-100")}>
                                    {isPaid ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                                    {isPaid ? "Payment Cleared" : "Outstanding Credit"}
                                </div>
                            )}
                        </div>

                        <div className="space-y-3">
                            <h3 className="text-[11px] font-bold text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2">
                                Remarks / Notes
                            </h3>
                            {isEditing ? (
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    className="w-full h-20 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-medium focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-300"
                                    placeholder="Internal auditing notes..."
                                />
                            ) : (
                                <p className="text-xs font-bold text-slate-500 leading-relaxed italic opacity-80 uppercase tracking-tight">
                                    {notes || "No remarks on file."}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* 4. ITEMIZATION TABLE */}
                    <div className="px-8 pb-10">
                        <div className="border border-slate-300 overflow-hidden shadow-sm">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-slate-600 text-[12px] font-black text-white uppercase tracking-[0.25em]">
                                        <th className="px-6 py-4 text-left">Description</th>
                                        <th className="px-6 py-4 text-center">Qty / Unit</th>
                                        <th className="px-6 py-4 text-center">Price</th>
                                        <th className="px-6 py-4 text-right">Line Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {txn.items?.map((item: any, idx: number) => (
                                        <tr key={idx} className="hover:bg-slate-50/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-slate-50 text-slate-300 flex items-center justify-center border border-slate-100">
                                                        <Package size={14} className="text-blue-600" />
                                                    </div>
                                                    <span className="font-black text-slate-800 text-xs uppercase tracking-tight">{item.product?.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="text-[11px] font-black text-slate-700">
                                                    {item.qty} <span className="text-[9px] text-slate-400 ml-0.5 uppercase">{item.unit?.shortForm || item.unit?.name}</span>
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="text-[11px] font-bold text-slate-400 italic">Rs. {item.rate?.toLocaleString()}</span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="text-xs font-black text-slate-900 tabular-nums uppercase">Rs. {item.total?.toLocaleString()}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <BillReceipt txn={txn} />
        </div>
    );
}