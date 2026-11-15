import { useEffect, useState } from "react";
import { ArrowRight, ArrowRightLeft, BarChart3, BookOpen, ClipboardList, Package, Receipt, Search, TriangleAlert } from "lucide-react";
import { Link } from "react-router-dom";
import { PageHeader } from "@/components/common/PageHeader";
import { useAuthStore } from "@/store/authStore";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { UserRole } from "@/types/user";
import type { LucideIcon } from "lucide-react";

type ReportLink = { label: string; to: string; icon: LucideIcon; detail: string; roles: UserRole[] };

const groups: { title: string; reports: ReportLink[] }[] = [
    {
        title: "Sales and finance",
        reports: [
            { label: "Sales and invoices", to: "/reports/transactions", icon: Receipt, detail: "Find a transaction or open its bill.", roles: ["admin", "owner", "accountant"] },
            { label: "Sales by channel", to: "/reports/transactions?view=channels", icon: BarChart3, detail: "Compare in-store and online sales.", roles: ["admin", "owner", "accountant"] },
            { label: "Accounting report", to: "/reports/accounting", icon: BookOpen, detail: "Review invoiced sales, outstanding balances, and the ledger.", roles: ["admin", "owner", "accountant"] },
        ],
    },
    {
        title: "Inventory",
        reports: [
            { label: "Stock report", to: "/reports/stock", icon: Package, detail: "Review stock levels and reconcile counts.", roles: ["admin", "owner"] },
            { label: "Low stock", to: "/reports/stock?level=low", icon: TriangleAlert, detail: "Open products already filtered to low stock.", roles: ["admin", "owner"] },
            { label: "Stock movements", to: "/reports/movement", icon: ArrowRightLeft, detail: "Trace stock coming in and going out.", roles: ["admin", "owner"] },
        ],
    },
    {
        title: "Administration",
        reports: [
            { label: "System log", to: "/reports/activity", icon: ClipboardList, detail: "Review recorded user and system activity.", roles: ["admin"] },
        ],
    },
];

export default function ReportsHub() {
    const role = useAuthStore((state) => state.user?.role);
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const matches = groups.flatMap(({ title, reports }) => reports.filter((report) =>
        role && report.roles.includes(role) &&
        `${title} ${report.label} ${report.detail}`.toLowerCase().includes(query.trim().toLowerCase()),
    ));

    useEffect(() => {
        const openFinder = (event: KeyboardEvent) => {
            if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
                event.preventDefault();
                setQuery("");
                setOpen(true);
            }
        };
        window.addEventListener("keydown", openFinder);
        return () => window.removeEventListener("keydown", openFinder);
    }, []);

    return (
        <section className="min-w-0 space-y-4">
            <PageHeader title="Reports" icon={BarChart3}>
                <Dialog open={open} onOpenChange={(next) => { setOpen(next); if (next) setQuery(""); }}>
                    <DialogTrigger asChild>
                        <Button variant="outline" size="sm"><Search aria-hidden="true" /> Find a report</Button>
                    </DialogTrigger>
                    <DialogContent aria-describedby={undefined}>
                        <DialogTitle>Find a report</DialogTitle>
                        <Input autoFocus aria-label="Search reports" placeholder="Try invoices, low stock, or activity" value={query}
                            onChange={(event) => setQuery(event.target.value)} />
                        {matches.length ? (
                            <ul className="divide-y divide-border">
                                {matches.map(({ label, to, icon: Icon }) => (
                                    <li key={to}>
                                        <Link to={to} onClick={() => setOpen(false)} className="flex min-h-10 items-center gap-3 rounded-md px-2 text-sm hover:bg-accent">
                                            <Icon aria-hidden="true" className="size-4 shrink-0 text-link" />
                                            {label}
                                            <ArrowRight aria-hidden="true" className="ml-auto size-4 shrink-0 text-link" />
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        ) : <p role="status" className="text-sm text-muted-foreground">No matching reports.</p>}
                    </DialogContent>
                </Dialog>
            </PageHeader>
            <div className="grid items-start gap-4 xl:grid-cols-2">
                {groups.map(({ title, reports }) => {
                    const available = reports.filter((report) => role && report.roles.includes(role));
                    if (!available.length) return null;

                    return (
                        <section key={title} aria-label={title} className="min-w-0 overflow-hidden rounded-lg border border-border bg-card">
                            <h2 className="border-b border-border bg-muted px-4 py-3 text-sm font-semibold sm:px-5">{title}</h2>
                            <ul className="divide-y divide-border">
                                {available.map(({ label, to, icon: Icon, detail }) => (
                                    <li key={to}>
                                        <Link to={to} className="group flex min-h-16 items-center gap-3 px-4 py-3 hover:bg-accent focus-visible:-outline-offset-2 sm:px-5">
                                            <span className="grid size-9 shrink-0 place-items-center rounded-md bg-accent text-accent-foreground">
                                                <Icon aria-hidden="true" className="size-4" />
                                            </span>
                                            <span className="min-w-0 flex-1">
                                                <span className="block text-sm font-semibold">{label}</span>
                                                <span className="mt-0.5 block text-sm text-muted-foreground">{detail}</span>
                                            </span>
                                            <ArrowRight aria-hidden="true" className="size-4 shrink-0 text-link motion-safe:transition-transform motion-safe:group-hover:translate-x-0.5" />
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    );
                })}
            </div>
        </section>
    );
}
