import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

type Channel = "online" | "in_store";
type Data = {
    channels: { _id: Channel; sales: number; revenue: number }[];
    products: { _id: { productId: string; channel: Channel }; name?: string; baseQuantity: number; revenue: number }[];
};
const label = { online: "Online", in_store: "In store" };
const money = new Intl.NumberFormat("en-NP", { style: "currency", currency: "NPR" });

export function SalesChannels() {
    const [data, setData] = useState<Data | null>(null);
    const [failed, setFailed] = useState(false);
    useEffect(() => {
        let active = true;
        api.get<{ data: Data }>("/checkout/sales-summary").then(
            (response) => { if (active) setData(response.data.data); },
            () => { if (active) setFailed(true); },
        );
        return () => { active = false; };
    }, []);
    return (
        <section className="space-y-4 rounded-lg border bg-card p-4">
            <h2 className="font-semibold">Sales by channel · all time</h2>
            {failed ? <p className="text-sm text-muted-foreground">Channel totals could not be loaded.</p> : !data ? <Skeleton role="status" aria-label="Loading sales totals" className="h-20" /> : (
                <>
                    <div className="grid gap-3 sm:grid-cols-2">
                        {(["in_store", "online"] as const).map((channel) => {
                            const total = data.channels.find((row) => row._id === channel);
                            return <div key={channel} className="rounded-md bg-muted p-3 text-sm"><p>{label[channel]}</p><p className="font-semibold">{money.format(total?.revenue ?? 0)} · {total?.sales ?? 0} sales</p></div>;
                        })}
                    </div>
                    {data.products.length > 0 && <details>
                        <summary className="cursor-pointer text-sm font-semibold">Top products by channel</summary>
                        <div className="overflow-x-auto">
                            <table className="records-table mt-2 w-full text-left text-sm">
                                <thead><tr><th className="p-2">Product</th><th className="p-2">Channel</th><th className="whitespace-nowrap p-2 text-right">Base units sold</th><th className="whitespace-nowrap p-2 text-right">Sales</th></tr></thead>
                                <tbody className="divide-y">{data.products.map((row) => (
                                    <tr data-record key={`${row._id.productId}:${row._id.channel}`}><td className="p-2">{row.name ?? row._id.productId}</td><td className="p-2">{label[row._id.channel]}</td><td className="whitespace-nowrap p-2 text-right">{row.baseQuantity.toLocaleString()}</td><td className="whitespace-nowrap p-2 text-right">{money.format(row.revenue)}</td></tr>
                                ))}</tbody>
                            </table>
                        </div>
                    </details>}
                </>
            )}
        </section>
    );
}
