import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import {
    ArrowLeft, Save, Edit2, X, Printer, Receipt,
    Calendar, User, FileText, CheckCircle2, XCircle, Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useMovementTransactions } from "../../hooks/useMovementTransactions";
import type { TransactionData } from "@/types/Transaction";
import { BillReceipt } from "../../components/BillReceipt";

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
            <div className="h-screen flex flex-col items-center justify-center space-y-4">
                <p className="text-slate-500 font-bold">Transaction Data Missing</p>
                <Button onClick={() => navigate("/transactions")}>Return to List</Button>
            </div>
        );
    }

    const handleUpdate = async () => {
        try {
            if (!id) return;
            const success = await updateCreditStatus(id, { isPaid, notes });
            if (success) {
                toast.success("Transaction updated successfully");
                setIsEditing(false);
            }
        } catch (error) {
            toast.error("Failed to update transaction");
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            <div className="no-print space-y-6">
                {/* Action Header */}
                <div className="flex justify-between items-center px-2">
                    <Button variant="ghost" onClick={() => navigate(-1)} className="group gap-2 text-slate-500 font-bold text-[10px] tracking-widest uppercase hover:bg-transparent">
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to History
                    </Button>
                    <div className="flex gap-3">
                        <Button variant="outline" onClick={() => window.print()} className="rounded-xl gap-2 font-bold text-xs h-10 border-slate-200 shadow-sm">
                            <Printer size={16} /> Print
                        </Button>
                        {!isEditing ? (
                            <Button onClick={() => setIsEditing(true)} className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl gap-2 font-bold text-xs h-10 shadow-sm">
                                <Edit2 size={16} /> Edit Status
                            </Button>
                        ) : (
                            <div className="flex gap-2">
                                <Button variant="ghost" onClick={() => setIsEditing(false)} className="text-rose-500 font-bold text-xs">
                                    <X size={16} /> Cancel
                                </Button>
                                <Button onClick={handleUpdate} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl gap-2 font-bold text-xs h-10 shadow-md">
                                    <Save size={16} /> Save Changes
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Invoice Style Card */}
                <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-xl shadow-slate-200/50 overflow-hidden">
                    {/* Top Brand Section */}
                    <div className="p-10 bg-slate-50/50 border-b border-slate-100 flex justify-between items-start">
                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                                    <Receipt size={28} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h1 className="text-3xl font-black text-slate-900 tracking-tighter">
                                            INV-{id?.slice(-6).toUpperCase()}
                                        </h1>
                                        <Badge className={cn("px-2 py-0.5 rounded-md border-none font-black text-[9px] uppercase",
                                            txn.transactionType === 'Sale' ? "bg-blue-100 text-blue-700" : "bg-emerald-100 text-emerald-700")}>
                                            {txn.transactionType}
                                        </Badge>
                                    </div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Digital Receipt</p>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-8">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Date Issued</p>
                                    <p className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                        <Calendar size={14} className="text-indigo-500" />
                                        {new Date(txn.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </p>
                                </div>
                                <div className="space-y-1 border-l border-slate-200 pl-8">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Customer / Party</p>
                                    <p className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                        <User size={14} className="text-indigo-500" />
                                        {txn.partyDetails?.name || "Walking Customer"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="text-right">
                            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm inline-block">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Grand Total</p>
                                <p className="text-4xl font-black text-slate-900 leading-none">
                                    <span className="text-lg mr-1 text-slate-400">Rs.</span>
                                    {txn.grandTotal?.toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-12">
                        {/* Payment Status Info */}
                        <div className="space-y-4">
                            <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                Settlement Status
                            </h3>
                            {isEditing ? (
                                <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl w-fit">
                                    <Button
                                        onClick={() => setIsPaid(true)}
                                        className={cn("rounded-xl font-bold text-xs px-6 transition-all", isPaid ? "bg-white text-emerald-600 shadow-sm" : "bg-transparent text-slate-500 hover:bg-slate-200")}
                                    >
                                        Paid
                                    </Button>
                                    <Button
                                        onClick={() => setIsPaid(false)}
                                        className={cn("rounded-xl font-bold text-xs px-6 transition-all", !isPaid ? "bg-white text-rose-600 shadow-sm" : "bg-transparent text-slate-500 hover:bg-slate-200")}
                                    >
                                        Unpaid
                                    </Button>
                                </div>
                            ) : (
                                <div className={cn("inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm",
                                    isPaid ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-rose-50 text-rose-700 border border-rose-100")}>
                                    {isPaid ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                                    {isPaid ? "Payment Cleared" : "Outstanding Credit"}
                                </div>
                            )}
                        </div>

                        {/* Notes Section */}
                        <div className="space-y-4">
                            <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                <FileText size={16} className="text-slate-400" /> Remarks
                            </h3>
                            {isEditing ? (
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    className="w-full h-20 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                                    placeholder="Add notes for this transaction..."
                                />
                            ) : (
                                <p className="text-sm font-medium text-slate-500 leading-relaxed italic">
                                    {notes || "No additional remarks provided."}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Items Table */}
                    <div className="px-10 pb-12">
                        <div className="rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-slate-900 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                        <th className="px-8 py-5 text-left">Product / Description</th>
                                        <th className="px-8 py-5 text-center">Qty / Unit</th>
                                        <th className="px-8 py-5 text-center">Unit Price</th>
                                        <th className="px-8 py-5 text-right">Line Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {txn.items?.map((item: any, idx: number) => (
                                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                                                        <Package size={16} />
                                                    </div>
                                                    <span className="font-bold text-slate-800">{item.product?.name || "Unknown Product"}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-center">
                                                <span className="text-sm font-bold text-slate-600">
                                                    {item.qty} <span className="text-[10px] text-slate-400 ml-0.5 uppercase">{item.unit?.name || 'pcs'}</span>
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-center">
                                                <span className="text-sm font-bold text-slate-500 italic">Rs. {item.rate?.toLocaleString()}</span>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <span className="text-sm font-black text-slate-900">Rs. {item.total?.toLocaleString()}</span>
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