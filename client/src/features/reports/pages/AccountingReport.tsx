import { BookOpen, CircleAlert } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";

type Account = { account: string; debitMinor: string; creditMinor: string };
type AccountingData = { currency: string; accounts: Account[]; invoicesWithoutCost: number };

function money(minor: string) {
    const value = BigInt(minor);
    const sign = value < 0n ? "âˆ’" : "";
    const amount = value < 0n ? -value : value;
    return `${sign}${(amount / 100n).toLocaleString("en-NP")}.${String(amount % 100n).padStart(2, "0")}`;
}

export default function AccountingReport() {
    const [report, setReport] = useState<AccountingData | null>(null);
    const [failed, setFailed] = useState(false);
    const [request, refresh] = useState(0);

    useEffect(() => {
        let active = true;
        api.get<{ data: AccountingData }>("/billing/accounts").then(
            ({ data }) => { if (active) setReport(data.data); },
            () => { if (active) setFailed(true); },
        );
        return () => { active = false; };
    }, [request]);

    const debits = report?.accounts.reduce((total, account) => total + BigInt(account.debitMinor), 0n) ?? 0n;
    const credits = report?.accounts.reduce((total, account) => total + BigInt(account.creditMinor), 0n) ?? 0n;
    const hasEntries = !!report?.accounts.length;

    return (
        <section className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6 sm:px-6 sm:py-9">
            <header>
                <h1 className="text-3xl font-semibold tracking-tight">Accounting report</h1>
                <p className="mt-1 text-sm text-muted-foreground">Posted debits and credits by ledger account.</p>
            </header>
            {failed ? (
                <div role="alert" className="space-y-3 rounded-xl border border-border bg-card p-5">
                    <p className="text-sm text-muted-foreground">Could not load accounting balances.</p>
                    <Button variant="outline" onClick={() => { setFailed(false); refresh((n) => n + 1); }}>Retry</Button>
                </div>
            ) : !report ? <LoadingSkeleton label="Loading accounting report" /> : (
                <>
                    {hasEntries && (
                        <dl className="grid gap-3 sm:grid-cols-3">
                            {[
                                { label: "Total debits", value: `${report.currency} ${money(String(debits))}` },
                                { label: "Total credits", value: `${report.currency} ${money(String(credits))}` },
                                { label: "Invoices awaiting inventory cost", value: report.invoicesWithoutCost },
                            ].map(({ label, value }) => (
                                <div key={label} className="rounded-xl border border-border bg-card p-4 sm:p-5">
                                    <dt className="text-sm text-muted-foreground">{label}</dt>
                                    <dd className="mt-1 wrap-anywhere text-xl font-semibold tabular-nums">{value}</dd>
                                </div>
                            ))}
                        </dl>
                    )}
                    {debits !== credits && (
                        <p role="alert" className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-card p-4 text-sm text-foreground">
                            <CircleAlert aria-hidden="true" className="size-4 shrink-0 text-destructive" /> Posted debits and credits do not balance.
                        </p>
                    )}
                    <section aria-labelledby="balances-title" className="overflow-hidden rounded-xl border border-border bg-card">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-5 py-4">
                            <h2 id="balances-title" className="font-semibold">Account balances</h2>
                            <span className="text-sm text-muted-foreground">{report.currency}</span>
                        </div>
                        {hasEntries ? (
                            <div className="max-h-[min(32rem,60dvh)] overflow-auto" tabIndex={0} role="region" aria-label="Ledger balances table">
                                <table className="records-table w-full min-w-[32rem] text-left text-sm">
                                    <thead className="sticky top-0 bg-muted text-muted-foreground">
                                        <tr><th scope="col" className="px-5 py-4">Account</th><th scope="col" className="px-5 py-4 text-right">Debits</th><th scope="col" className="px-5 py-4 text-right">Credits</th><th scope="col" className="px-5 py-4 text-right">Net debit</th></tr>
                                    </thead>
                                    <tbody>
                                        {report.accounts.map((account) => (
                                            <tr key={account.account} data-record>
                                                <th scope="row" className="px-5 py-4 font-medium capitalize">{account.account.replaceAll("_", " ")}</th>
                                                <td className="px-5 py-4 whitespace-nowrap text-right tabular-nums">{money(account.debitMinor)}</td>
                                                <td className="px-5 py-4 whitespace-nowrap text-right tabular-nums">{money(account.creditMinor)}</td>
                                                <td className="px-5 py-4 whitespace-nowrap text-right tabular-nums">{money(String(BigInt(account.debitMinor) - BigInt(account.creditMinor)))}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="border-t border-border bg-muted font-semibold tabular-nums">
                                        <tr><th scope="row" className="px-5 py-4">Total</th><td className="px-5 py-4 text-right">{money(String(debits))}</td><td className="px-5 py-4 text-right">{money(String(credits))}</td><td className="px-5 py-4 text-right">{money(String(debits - credits))}</td></tr>
                                    </tfoot>
                                </table>
                            </div>
                        ) : (
                            <div className="grid justify-items-center gap-3 px-5 py-10 text-center sm:py-12">
                                <span className="grid size-12 place-items-center rounded-xl bg-accent text-accent-foreground"><BookOpen aria-hidden="true" className="size-5" /></span>
                                <h3 className="font-semibold">No posted entries yet</h3>
                                <p className="max-w-md text-sm text-muted-foreground">Entries appear here after you issue a sales invoice or post a supplier bill. Completed checkouts post automatically.</p>
                                <div className="mt-1 flex flex-wrap justify-center gap-2">
                                    <Button asChild variant="outline"><Link to="/reports/transactions">Sales and invoices</Link></Button>
                                    <Button asChild variant="outline"><Link to="/suppliers">Suppliers</Link></Button>
                                </div>
                            </div>
                        )}
                    </section>
                </>
            )}
        </section>
    );
}
