import { useMovementTransactions } from "../../MovementTransaction/hooks/useMovementTransactions";
import { useEffect, useMemo, useState } from "react";
import { DataTable } from "@/components/common/DataTable";
import { getTransactionColumns } from "../components/TransactionColumns";
import { Button } from "@/components/ui/button";
import { Download, Search, Receipt } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { Loading } from "@/lib/loader";
import { notify } from "@/lib/toast";
import { exportToCSV } from "@/lib/csvExport";
import { useDebounce } from "@/lib/debounce";
import { AdminGate } from "@/features/auth/components/AdminGate";
import type { Item, TransactionData } from "@/types/transaction";
import { SalesChannels } from "../components/SalesChannels";

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
    }, [fetchTransactions, pagination, debouncedSearch, transactionType, dateRange, IsExporting]);

    const handleExport = async () => {
        setIsExporting(true);
        try {
            const records = await fetchTransactions(1, 1000, debouncedSearch, transactionType, dateRange.start, dateRange.end, true);
            if (!records) return;
            const rows = records.flatMap((t: TransactionData) => t.items.map((item: Item) => ({
                "Date": new Date(t.createdAt).toLocaleDateString(),
                "Invoice": t._id.slice(-6).toUpperCase(),
                "Type": t.transactionType,
                "Channel": t.transactionType === "Sale" ? t.channel ?? "in_store" : "",
                "Payment method": t.paymentMethod ?? "",
                "Fulfillment": t.fulfillment ?? "",
                "Party": t.partyDetails?.name || "Cash Customer",
                "Product": item.productName,
                "Total": item.total,
                "Status": t.isPaid ? "Paid" : "Credit"
            })));
            exportToCSV(rows, `Transactions_${new Date().toISOString().split('T')[0]}`);
            notify.success("Export Complete");
        } finally {
            setIsExporting(false);
        }
    };

    const columns = useMemo(() => getTransactionColumns(navigate), [navigate]);

    const filtered = Boolean(searchQuery || dateRange.start || dateRange.end || transactionType !== "All Types");
    const firstPage = () => setPagination((previous) => ({ ...previous, pageIndex: 0 }));
    const clearFilters = () => {
        setSearchQuery("");
        setDateRange({ start: "", end: "" });
        setTransactionType("All Types");
        firstPage();
    };
    const fieldStyle = "h-10 w-full min-w-0 rounded-lg border border-input bg-card px-3 text-sm";

    return (
        <section className="mx-auto w-full max-w-6xl space-y-7 px-4 py-7 sm:px-6 sm:py-10">
            <header className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-semibold tracking-tight">Sales and invoices</h1>
                    <p className="mt-1 text-sm text-muted-foreground">Find transactions, open receipts, and review sales by channel.</p>
                </div>
                <AdminGate allowedRoles={["admin", "owner", "accountant"]}>
                    <Button variant="outline" onClick={handleExport} disabled={IsExporting || isLoading || !meta?.totalItems}>
                        {IsExporting ? <><Loading /> Exporting…</> : <><Download aria-hidden="true" /> Export CSV</>}
                    </Button>
                </AdminGate>
            </header>

            <SalesChannels />

            <section aria-labelledby="transaction-list" className="min-w-0 overflow-hidden rounded-xl border border-border bg-card">
                <div className="space-y-4 border-b border-border p-5 sm:p-6">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <h2 id="transaction-list" className="font-semibold">Transactions</h2>
                        {filtered && <Button variant="ghost" size="sm" onClick={clearFilters}>Clear filters</Button>}
                    </div>
                    <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-[minmax(0,2fr)_repeat(3,minmax(0,1fr))]">
                        <label className="grid min-w-0 gap-1.5 text-sm font-medium sm:col-span-3 lg:col-span-1">
                            Search transactions
                            <span className="relative">
                                <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                <Input placeholder="Party name or notes" className="pl-9" value={searchQuery} onChange={(event) => { setSearchQuery(event.target.value); firstPage(); }} />
                            </span>
                        </label>
                        <label className="grid min-w-0 gap-1.5 text-sm font-medium">
                            From
                            <input type="date" className={fieldStyle} value={dateRange.start} max={dateRange.end || undefined} onChange={(event) => { setDateRange({ ...dateRange, start: event.target.value }); firstPage(); }} />
                        </label>
                        <label className="grid min-w-0 gap-1.5 text-sm font-medium">
                            To
                            <input type="date" className={fieldStyle} value={dateRange.end} min={dateRange.start || undefined} onChange={(event) => { setDateRange({ ...dateRange, end: event.target.value }); firstPage(); }} />
                        </label>
                        <label className="grid min-w-0 gap-1.5 text-sm font-medium">
                            Type
                            <select className={fieldStyle} value={transactionType} onChange={(event) => { setTransactionType(event.target.value); firstPage(); }}>
                                <option>All Types</option>
                                <option>Sale</option>
                                <option>Purchase</option>
                                <option>Return</option>
                                <option>Damage</option>
                                <option>Adjustment</option>
                            </select>
                        </label>
                    </div>
                </div>
                <DataTable embedded
                    columns={columns}
                    data={transactions || []}
                    rowCount={meta?.totalItems || 0}
                    pageCount={meta?.totalPages || 0}
                    pagination={pagination}
                    setPagination={setPagination}
                    isLoading={isLoading}
                    emptyState={<div className="grid justify-items-center gap-2 whitespace-normal">
                        <Receipt aria-hidden="true" className="size-6 text-link" />
                        <p className="font-medium text-foreground">{filtered ? "No matching transactions" : "No transactions yet"}</p>
                        <p>{filtered ? "Try a different search or date range." : "Recorded sales and returns will appear here."}</p>
                    </div>}
                />
            </section>
        </section>
    );
}
