import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";

type Account = { account: string; debitMinor: string; creditMinor: string };
type AccountingData = { currency: string; accounts: Account[]; invoicesWithoutCost: number };

function money(minor: string) {
    const value = BigInt(minor);
    const sign = value < 0n ? "−" : "";
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

    if (failed) return <Button variant="outline" onClick={() => { setFailed(false); refresh((n) => n + 1); }}>Retry accounting report</Button>;
    if (!report) return <LoadingSkeleton label="Loading accounting report" />;
    const debits = report.accounts.reduce((total, account) => total + BigInt(account.debitMinor), 0n);
    const credits = report.accounts.reduce((total, account) => total + BigInt(account.creditMinor), 0n);

    return (
        <section className="mx-auto max-w-4xl space-y-5">
            <Link to="/reports" className="text-sm text-blue-700">Back to reports</Link>
            <h1 className="text-xl font-bold">Accounting report</h1>
            <p className="text-sm text-slate-600">Posted balances in {report.currency}. {report.invoicesWithoutCost} invoices awaiting inventory cost.</p>
            {debits !== credits && <p role="alert" className="text-sm text-red-700">Posted debits and credits do not balance.</p>}
            <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50">
                        <tr><th className="p-3">Account</th><th className="p-3 text-right">Debits</th><th className="p-3 text-right">Credits</th><th className="p-3 text-right">Net debit</th></tr>
                    </thead>
                    <tbody className="divide-y">
                        {report.accounts.map((account) => (
                            <tr key={account.account}>
                                <th scope="row" className="p-3 font-medium capitalize">{account.account.replaceAll("_", " ")}</th>
                                <td className="p-3 text-right tabular-nums">{money(account.debitMinor)}</td>
                                <td className="p-3 text-right tabular-nums">{money(account.creditMinor)}</td>
                                <td className="p-3 text-right tabular-nums">{money(String(BigInt(account.debitMinor) - BigInt(account.creditMinor)))}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot className="border-t bg-slate-50 font-semibold">
                        <tr><th className="p-3">Total</th><td className="p-3 text-right">{money(String(debits))}</td><td className="p-3 text-right">{money(String(credits))}</td><td className="p-3 text-right">{money(String(debits - credits))}</td></tr>
                    </tfoot>
                </table>
            </div>
        </section>
    );
}
