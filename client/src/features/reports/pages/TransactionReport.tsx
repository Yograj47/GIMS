import { PageHeader } from "@/components/common/PageHeader";
import { useAuthStore } from "@/store/authStore";
import { useMovementTransactions } from "../../MovementTransaction/hooks/useMovementTransactions";
import { useEffect, useMemo, useState } from "react";
import { DataTable } from "@/components/common/DataTable";
import { getTransactionColumns } from "../components/TransactionColumns";
import { Button } from "@/components/ui/button";
import { Download, Search, Receipt } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { cn } from "@/lib/utils";
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
    const [searchParams] = useSearchParams();
    const accountant = useAuthStore((state) => state.user?.role === "accountant");
    const showChannels = searchParams.get("view") === "channels";
    const debouncedSearch = useDebounce(searchQuery, 500);

    useEffect(() => {
        if (!IsExporting && !showChannels) {
            fetchTransactions(
                pagination.pageIndex + 1,
                pagination.pageSize,
                debouncedSearch,
                transactionType,
                dateRange.start,
                dateRange.end
            );
        }
    }, [fetchTransactions, pagination, debouncedSearch, transactionType, dateRange, IsExporting, showChannels]);

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
    const fieldStyle = "h-9 w-full min-w-0 rounded-lg border border-input bg-card px-3 text-sm";

    return (
        <section className={cn("w-full space-y-3", accountant && "p-3 sm:p-4",
            !showChannels && (accountant ? "lg:flex lg:h-dvh lg:flex-col" : "lg:flex lg:h-[calc(100dvh-2.5rem)] lg:flex-col"))}>
            <PageHeader title={showChannels ? "Sales by channel" : "Sales and invoices"} icon={Receipt}>
                {!showChannels && <AdminGate allowedRoles={["admin", "owner", "accountant"]}>
                    <Button size="sm" variant="outline" onClick={handleExport} disabled={IsExporting || isLoading || !meta?.totalItems}>
                        {IsExporting ? <><Loading /> Exporting...</> : <><Download aria-hidden="true" /> Export CSV</>}
                    </Button>
                </AdminGate>}
            </PageHeader>

            {!accountant && <nav aria-label="Sales and invoices views" className="flex flex-wrap gap-2 border-b border-border pb-2">
                {[
                    { label: "Transactions", view: "", active: !showChannels },
                    { label: "Sales by channel", view: "channels", active: showChannels },
                ].map(({ label, view, active }) => {
                    const params = new URLSearchParams(searchParams);
                    if (view) params.set("view", view);
                    else params.delete("view");
                    return (
                        <Link key={label} to={{ search: params.toString() }} aria-current={active ? "page" : undefined}
                            className={cn("inline-flex min-h-9 items-center rounded-md px-3 text-sm font-medium",
                                active ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground")}>
                            {label}
                        </Link>
                    );
                })}
            </nav>}

            {showChannels ? <SalesChannels /> : <div className="transaction-list min-w-0 lg:flex lg:min-h-0 lg:flex-1 lg:flex-col">
                <DataTable fill
                    toolbar={
                    <div className="grid items-end gap-2 sm:grid-cols-3 lg:grid-cols-[minmax(0,2fr)_repeat(3,minmax(0,1fr))_auto]">
                        <label className="grid min-w-0 gap-1.5 text-sm font-medium sm:col-span-3 lg:col-span-1">
                            <span className="sr-only">Search transactions</span>
                            <span className="relative">
                                <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                <Input placeholder="Party name or notes" className="h-9 pl-9" value={searchQuery} onChange={(event) => { setSearchQuery(event.target.value); firstPage(); }} />
                            </span>
                        </label>
                        <label className="grid min-w-0 gap-1.5 text-sm font-medium">
                            <span className="text-xs text-muted-foreground">From</span>
                            <input type="date" className={fieldStyle} value={dateRange.start} max={dateRange.end || undefined} onChange={(event) => { setDateRange({ ...dateRange, start: event.target.value }); firstPage(); }} />
                        </label>
                        <label className="grid min-w-0 gap-1.5 text-sm font-medium">
                            <span className="text-xs text-muted-foreground">To</span>
                            <input type="date" className={fieldStyle} value={dateRange.end} min={dateRange.start || undefined} onChange={(event) => { setDateRange({ ...dateRange, end: event.target.value }); firstPage(); }} />
                        </label>
                        <label className="grid min-w-0 gap-1.5 text-sm font-medium">
                            <span className="sr-only">Type</span>
                            <select className={fieldStyle} value={transactionType} onChange={(event) => { setTransactionType(event.target.value); firstPage(); }}>
                                <option>All Types</option>
                                <option>Sale</option>
                                <option>Purchase</option>
                                <option>Return</option>
                                <option>Damage</option>
                                <option>Adjustment</option>
                            </select>
                        </label>
                        {filtered && <Button variant="ghost" size="sm" className="justify-self-start" onClick={clearFilters}>Clear filters</Button>}
                    </div>
                    }
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
            </div>}
        </section>
    );
}
