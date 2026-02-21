import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import { 
  ArrowLeft, Save, Edit2, X, Printer, Receipt, 
  Calendar, User, FileText, CheckCircle2, XCircle, Package 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useMovementTransactions } from "../../hooks/useMovementTransactions";
import type { TransactionData } from "@/types/Transaction";

export default function TransactionViewPage() {
    const { state } = useLocation();
    const navigate = useNavigate();
    const { id } = useParams();

    // Use state-passed data
    const txn:TransactionData = state?.transaction;

    const [isEditing, setIsEditing] = useState(false);
    const [isPaid, setIsPaid] = useState(txn?.isPaid);
    const [notes, setNotes] = useState(txn?.notes || "");
    const { updateCreditStatus } = useMovementTransactions();

    console.log(txn);
    

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
            if (!id) {
                toast.error("Transaction ID is missing");
                return;
            }
            const success = await updateCreditStatus(id, { isPaid, notes });

            if (!success) {
                toast.error("Failed to update transaction");
                return;
            }
            
            toast.success("Transaction updated successfully");
            setIsEditing(false);
        } catch (error) {
            toast.error("Failed to update transaction");
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            {/* Action Header */}
            <div className="flex justify-between items-center">
                <Button variant="ghost" onClick={() => navigate(-1)} className="group gap-2 text-slate-500 font-bold text-[10px] tracking-widest uppercase">
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back
                </Button>
                <div className="flex gap-3">
                    <Button variant="outline" className="rounded-2xl gap-2 font-bold text-xs h-10 border-slate-200 shadow-sm">
                        <Printer size={16} /> Print Invoice
                    </Button>
                    {!isEditing ? (
                        <Button onClick={() => setIsEditing(true)} className="bg-indigo-600 hover:bg-indigo-700 rounded-2xl gap-2 font-bold text-xs h-10 shadow-md shadow-indigo-100">
                            <Edit2 size={16} /> Edit Record
                        </Button>
                    ) : (
                        <div className="flex gap-2">
                            <Button variant="ghost" onClick={() => setIsEditing(false)} className="text-rose-500 font-bold text-xs">
                                <X size={16} /> Cancel
                            </Button>
                            <Button onClick={handleUpdate} className="bg-emerald-600 hover:bg-emerald-700 rounded-2xl gap-2 font-bold text-xs h-10 shadow-md shadow-emerald-100">
                                <Save size={16} /> Save Changes
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Invoice Style Card */}
            <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-sm overflow-hidden">
                {/* Header Banner */}
                <div className="p-10 border-b border-slate-50 bg-slate-50/50 flex flex-col md:flex-row justify-between items-start gap-6">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                                <Receipt size={24} />
                            </div>
                            <div>
                                <h1 className="text-2xl font-black text-slate-800 tracking-tight">TRX-{id?.slice(-6).toUpperCase()}</h1>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Transaction Record</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Badge className={cn("px-3 py-1 rounded-lg border-none font-black text-[10px] uppercase", 
                                txn.transactionType === 'Sale' ? "bg-blue-100 text-blue-700" : "bg-emerald-100 text-emerald-700")}>
                                {txn.transactionType}
                            </Badge>
                            <Badge className={cn("px-3 py-1 rounded-lg border-none font-black text-[10px] uppercase", 
                                isPaid ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700")}>
                                {isPaid ? "Settled / Paid" : "Credit / Pending"}
                            </Badge>
                        </div>
                    </div>
                    
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm min-w-60">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Amount Payable</p>
                        <p className="text-4xl font-black text-slate-900">Rs. {txn.grandTotal?.toLocaleString()}</p>
                    </div>
                </div>

                <div className="p-10 grid grid-cols-1 md:grid-cols-3 gap-10">
                    {/* Column 1: Metadata */}
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-[10px] font-black text-indigo-500 uppercase">
                                <Calendar size={14} /> Created At
                            </label>
                            <p className="text-sm font-bold text-slate-700">{new Date(txn.createdAt).toLocaleString()}</p>
                        </div>
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-[10px] font-black text-indigo-500 uppercase">
                                <User size={14} /> Party Details
                            </label>
                            <p className="text-sm font-bold text-slate-700">{txn.partyDetails?.name || "Walk-in Customer"}</p>
                            <p className="text-xs text-slate-400 font-medium">{txn.partyDetails?.phone || "No Phone Provided"}</p>
                        </div>
                    </div>

                    {/* Column 2: Payment Status Update */}
                    <div className="space-y-6">
                         <div className="space-y-4">
                            <label className="flex items-center gap-2 text-[10px] font-black text-indigo-500 uppercase">
                                Payment Settings
                            </label>
                            {isEditing ? (
                                <div className="flex gap-2">
                                    <Button 
                                        onClick={() => setIsPaid(true)}
                                        variant={isPaid ? "default" : "outline"}
                                        className={cn("rounded-xl font-bold text-xs flex-1", isPaid && "bg-emerald-600 hover:bg-emerald-700")}
                                    >
                                        Mark Paid
                                    </Button>
                                    <Button 
                                        onClick={() => setIsPaid(false)}
                                        variant={!isPaid ? "destructive" : "outline"}
                                        className="rounded-xl font-bold text-xs flex-1"
                                    >
                                        Mark Unpaid
                                    </Button>
                                </div>
                            ) : (
                                <div className={cn("flex items-center gap-2 p-3 rounded-2xl border", 
                                    isPaid ? "bg-emerald-50 border-emerald-100 text-emerald-600" : "bg-rose-50 border-rose-100 text-rose-600")}>
                                    {isPaid ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                                    <span className="text-sm font-black uppercase tracking-tight">{isPaid ? "Payment Received" : "Payment Awaited"}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Column 3: Notes */}
                    <div className="space-y-4">
                        <label className="flex items-center gap-2 text-[10px] font-black text-indigo-500 uppercase">
                            <FileText size={14} /> Internal Notes
                        </label>
                        {isEditing ? (
                            <textarea 
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="w-full h-24 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 outline-none"
                                placeholder="Add any specific details about this transaction..."
                            />
                        ) : (
                            <p className="text-sm font-medium text-slate-500 italic bg-slate-50/50 p-4 rounded-2xl border border-dashed border-slate-200">
                                {notes || "No notes available."}
                            </p>
                        )}
                    </div>
                </div>

                {/* Itemized List Section */}
                <div className="px-10 pb-10">
                    <div className="flex items-center gap-2 text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-4">
                        <Package size={14} /> Products in this Transaction
                    </div>
                    <div className="rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
                        <table className="w-full text-left">
                            <thead className="bg-slate-900 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                <tr>
                                    <th className="px-6 py-4">Description</th>
                                    <th className="px-6 py-4 text-center">Quantity</th>
                                    <th className="px-6 py-4 text-center">Rate</th>
                                    <th className="px-6 py-4 text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {txn.items?.map((item: any, idx: number) => (
                                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-5 font-bold text-slate-700 text-sm">
                                            {item.productId?.name || "Unknown Product"}
                                        </td>
                                        <td className="px-6 py-5 text-center text-sm font-bold text-slate-500">
                                            {item.qty} {item.unitName || 'units'}
                                        </td>
                                        <td className="px-6 py-5 text-center text-sm font-bold text-slate-500">
                                            Rs. {item.rate?.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-5 text-right text-sm font-black text-slate-900">
                                            Rs. {item.total?.toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}