import { useMovementTransactions } from "../../MovementTransaction/hooks/useMovementTransactions";
import { useEffect, useMemo, useState } from "react";
import { DataTable } from "@/components/common/DataTable";
import { getTransactionColumns } from "../components/TransactionColumns";
import { Button } from "@/components/ui/button";
import { Download, Search, History, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { Loading } from "@/lib/loader";
import { notify } from "@/lib/toast";
import { exportToCSV } from "@/lib/csvExport";
import { useDebounce } from "@/lib/debounce";
import { AdminGate } from "@/features/auth/components/AdminGate";

export default function Transaction() {
    const { fetchTransactions, transactions, isLoading, meta } = useMovementTransactions();
    const [searchQuery, setSearchQuery] = useState("");
    const [transactionType, setTransactionType] = useState<string>("All Types");
    const [dateRange, setDateRange] = useState({ start: "", end: "" });
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
    const [IsExporting, setIsExporting] = useState<boolean>(false);
    const navigate = useNavigate();
    const debouncedSearch = useDebounce(searchQuery, 500);

    useEffect(() => {
        if (!IsExporting) {
            fetchTransactions(
                pagination.pageIndex + 1,
                pagination.pageSize,
                debouncedSearch,
                transactionType,
                dateRange.start,
                dateRange.end
            );
        }
    }, [pagination, debouncedSearch, transactionType, dateRange]);

    const handleExport = async () => {
        setIsExporting(true);
        await fetchTransactions(1, 1000, debouncedSearch, transactionType, dateRange.start, dateRange.end, true);

        if (transactions) {
            const rows = transactions.flatMap((t: any) => t.items.map((item: any) => ({
                "Date": new Date(t.createdAt).toLocaleDateString(),
                "Invoice": t._id.slice(-6).toUpperCase(),
                "Type": t.transactionType,
                "Party": t.partyDetails?.name || "Cash Customer",
                "Product": item.product?.name,
                "Total": item.total,
                "Status": t.isPaid ? "Paid" : "Credit"
            })));
            exportToCSV(rows, `Transactions_${new Date().toISOString().split('T')[0]}`);
            notify.success("Export Complete");
        }
        setIsExporting(false);
    };

    const columns = useMemo(() => getTransactionColumns(navigate), [navigate]);

    return (
        <div className="h-full animate-in fade-in duration-500">
            <div className="max-w-400 mx-auto space-y-6">

                {/* PRECISION HEADER (Stock Style) */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-200 pb-6">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(-1)}
                            className="text-slate-500 hover:text-blue-600 group"
                        >
                            <div className="w-8 h-8 rounded-sm bg-slate-100 flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                                <ArrowLeft size={16} strokeWidth={3} className="group-hover:-translate-x-1 transition-transform" />
                            </div>
                        </Button>
                        <div className="p-2 bg-indigo-600 rounded-sm text-white">
                            <History size={20} />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900 tracking-tight uppercase">
                                Transaction List
                            </h1>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                Financial History • <span className="text-indigo-600 italic">Audit Mode</span>
                            </p>
                        </div>
                    </div>

                    <AdminGate allowedRoles={["owner"]}>
                        <Button
                            onClick={handleExport}
                            disabled={IsExporting}
                            className="h-9 px-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-sm text-[11px] font-bold uppercase tracking-wider transition-all shadow-sm"
                        >
                            {IsExporting ? <><Loading size="sm" className="mr-2" /> Processing...</> : <><Download size={14} className="mr-2" /> Export CSV</>}
                        </Button>
                    </AdminGate>
                </div>

                {/* PRECISION TOOLBAR */}
                <div className="flex flex-col lg:flex-row gap-3">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} strokeWidth={2.5} />
                        <Input
                            placeholder="Search by Party, Notes..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-10 pl-10 bg-white border-slate-200 rounded-sm text-sm focus-visible:ring-1 focus-visible:ring-indigo-500 shadow-none"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <input type="date" className="h-10 text-[10px] font-bold text-slate-600 bg-white p-2 rounded-sm border border-slate-200 outline-none" onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))} />
                        <input type="date" className="h-10 text-[10px] font-bold text-slate-600 bg-white p-2 rounded-sm border border-slate-200 outline-none" onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))} />
                    </div>

                    <div className="relative min-w-40">
                        <select
                            value={transactionType}
                            onChange={(e) => setTransactionType(e.target.value)}
                            className="w-full h-10 px-3 bg-white border border-slate-200 rounded-sm text-[11px] font-bold uppercase text-slate-600 outline-none appearance-none cursor-pointer"
                        >
                            <option>All Types</option>
                            <option value="Sale">Sale</option>
                            <option value="Purchase">Purchase</option>
                            <option value="Return">Return</option>
                        </select>
                    </div>
                </div>

                <div className="bg-white border border-slate-200 shadow-sm rounded-sm overflow-hidden">
                    <DataTable
                        columns={columns}
                        data={transactions || []}
                        rowCount={meta?.totalItems || 0}
                        pageCount={meta?.totalPages || 0}
                        pagination={pagination}
                        setPagination={setPagination}
                        isLoading={isLoading}
                    />
                </div>
            </div>
        </div>
    );
}