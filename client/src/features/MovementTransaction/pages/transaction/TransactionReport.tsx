import { Search, Eye, ArrowDownLeft, ArrowUpRight, CheckCircle2, XCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useMovementTransactions } from "../../hooks/useMovementTransactions";
import { useEffect } from "react";
import { Loading } from "@/lib/loader";
import { useNavigate } from "react-router-dom";

export default function Transaction() {
    const { fetchTransactions, transactions, isLoading } = useMovementTransactions();
    const navigate = useNavigate();

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    return (
        <div className="min-h-full space-y-6 animate-in fade-in duration-500">
            {/* Header Area */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight">Transaction List</h1>
                    <p className="text-sm font-medium text-slate-500 italic">History of all stock-related financial records</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="rounded-xl font-bold text-xs border-slate-200 text-slate-600">
                        Export PDF
                    </Button>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="flex gap-4 items-center bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <Input
                        placeholder="Search by transaction ID or notes..."
                        className="pl-10 h-11 border-none bg-transparent font-medium focus-visible:ring-0 shadow-none"
                    />
                </div>
                <div className="h-8 w-px bg-slate-200" />
                <select className="w-40 h-11 bg-transparent text-sm font-bold text-slate-600 outline-none cursor-pointer px-2">
                    <option>All Types</option>
                    <option>Sale</option>
                    <option>Purchase</option>
                </select>
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-6 font-bold text-xs h-11">
                    Apply Filter
                </Button>
            </div>

            {/* Transactions Table */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                            <th className="px-6 py-4">Transaction ID</th>
                            <th className="px-6 py-4">Type</th>
                            <th className="px-6 py-4 text-center">Amount</th>
                            <th className="px-6 py-4 text-center">Settled</th>
                            <th className="px-6 py-4">Notes</th>
                            <th className="px-6 py-4 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {
                            transactions.length === 0 && !isLoading && (
                                <tr>
                                    <td colSpan={6} className="text-center py-10 text-sm text-slate-400 font-medium">
                                        No transactions found. Try adjusting your search or filters.
                                    </td>
                                </tr>
                            )
                        }
                        {isLoading ? (
                            <tr>
                                <td colSpan={6} className="text-center py-10">
                                    <Loading />
                                </td>
                            </tr>
                        ) :
                            (transactions.map((txn) => (
                                <tr key={txn._id} className="group hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4 text-sm font-bold text-slate-700">{txn._id}</td>
                                    <td className="px-6 py-4">
                                        <div className={cn(
                                            "flex items-center gap-1.5 px-2.5 py-1 rounded-lg w-fit text-[10px] font-black uppercase",
                                            txn.transactionType === 'Sale' ? "bg-blue-50 text-blue-600" : "bg-emerald-50 text-emerald-600"
                                        )}>
                                            {txn.transactionType === 'Sale' ? <ArrowUpRight size={12} /> : <ArrowDownLeft size={12} />}
                                            {txn.transactionType}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-black text-slate-900 text-center">
                                        Rs {txn.grandTotal.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-center">
                                            {txn.isPaid ? (
                                                <div className="flex items-center gap-1 text-emerald-500 text-[11px] font-bold">
                                                    <CheckCircle2 size={16} /> Yes
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1 text-rose-500 text-[11px] font-bold">
                                                    <XCircle size={16} /> No
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-xs font-medium text-slate-400 truncate max-w-50">
                                        {txn.notes}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Button variant="ghost" size="sm"
                                            onClick={() => navigate(`/reports/transaction/${txn._id}`, { state: { transaction: txn } })}
                                            className="rounded-lg h-8 w-8 p-0 hover:bg-indigo-50 hover:text-indigo-600">
                                            <Eye size={16} />
                                        </Button>
                                    </td>
                                </tr>
                            )))}
                    </tbody>
                </table>

                {/* Pagination Footer */}
                <div className="px-6 py-4 bg-slate-50/30 border-t border-slate-100 flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <span>Showing 1 to 4 of 20 entries</span>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="h-8 rounded-lg border-slate-200 text-slate-500 font-bold" disabled>Prev</Button>
                        <Button size="sm" className="h-8 rounded-lg bg-indigo-600 text-white font-bold">1</Button>
                        <Button variant="outline" size="sm" className="h-8 rounded-lg border-slate-200 text-slate-500 font-bold">2</Button>
                        <Button variant="outline" size="sm" className="h-8 rounded-lg border-slate-200 text-slate-500 font-bold">Next</Button>
                    </div>
                </div>
            </div>
        </div>
    );
}