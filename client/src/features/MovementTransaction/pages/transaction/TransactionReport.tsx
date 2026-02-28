import { useMovementTransactions } from "../../hooks/useMovementTransactions";
import { useEffect, useMemo, useState } from "react";
import { DataTable } from "@/components/common/DataTable";
import { getTransactionColumns } from "../../components/TransactionColumns";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";

export default function Transaction() {
    const { fetchTransactions, transactions, isLoading, meta } = useMovementTransactions();
    const [searchQuery, setSearchQuery] = useState("");
    const [transactionType, setTransactionType] = useState<string>("All Types");
    const [dateRange, setDateRange] = useState({ start: "", end: "" });
    const navigate = useNavigate();

    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    });

    useEffect(() => {
        fetchTransactions(
            pagination.pageIndex + 1, 
            pagination.pageSize, 
            searchQuery, 
            transactionType,
            dateRange.start,
            dateRange.end
        );
    }, [fetchTransactions, pagination, searchQuery, transactionType, dateRange]);

    const columns = useMemo(() => getTransactionColumns(navigate), [navigate]);

    console.log(meta);
    

    return (
        <div className="min-h-full space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight">Transaction List</h1>
                    <p className="text-sm font-medium text-slate-500 italic">History of all stock-related financial records</p>
                </div>
                <Button variant="outline" className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-5 font-bold text-xs gap-2 h-11 shadow-sm transition-all">
                    Export PDF
                </Button>
            </div>

            <div className="flex gap-4 items-center bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <Input
                        placeholder="Search by Party, Notes..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 h-11 border-none bg-transparent font-medium focus-visible:ring-0 shadow-none"
                    />
                </div>
                
                <div className="h-8 w-px bg-slate-200" />
                
                {/* Date Inputs */}
                <div className="flex items-center gap-2">
                    <input 
                        type="date" 
                        className="text-[10px] font-bold text-slate-600 outline-none bg-slate-50 p-2 rounded-lg border border-slate-100"
                        onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                    />
                    <input 
                        type="date" 
                        className="text-[10px] font-bold text-slate-600 outline-none bg-slate-50 p-2 rounded-lg border border-slate-100"
                        onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                    />
                </div>

                <div className="h-8 w-px bg-slate-200" />

                <select 
                    value={transactionType}
                    onChange={(e) => setTransactionType(e.target.value)}
                    className="w-40 h-11 bg-transparent text-sm font-bold text-slate-600 outline-none cursor-pointer px-2"
                >
                    <option>All Types</option>
                    <option value="Sale">Sale</option>
                    <option value="Purchase">Purchase</option>
                    <option value="Return">Return</option>
                </select>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <DataTable
                    columns={columns} 
                    data={transactions || []}
                    pageCount={meta?.totalPages || 0}
                    rowCount={meta?.totalItems || 0}
                    pagination={pagination}
                    setPagination={setPagination}
                    isLoading={isLoading}
                />
            </div>
        </div>
    );
}