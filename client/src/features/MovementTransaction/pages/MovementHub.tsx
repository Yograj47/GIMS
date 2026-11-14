import { ArrowUpRight, Boxes, ClipboardList, PackageMinus, PackagePlus, RotateCcw, ShoppingCart, Truck } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";

const actions = [
    { title: "Make a sale", description: "Add products and take payment at the register.", path: "sale", icon: ShoppingCart, roles: ["admin", "staff"] },
    { title: "Receive a supplier delivery", description: "Record delivered quantities, costs, and stock lots.", path: "purchase", icon: PackagePlus, roles: ["admin", "owner"] },
    { title: "Record a customer return", description: "Put returned items back into sellable stock.", path: "customer-return", icon: RotateCcw, roles: ["admin", "staff"] },
    { title: "Return stock to a supplier", description: "Choose the original lot and record what goes back.", path: "supplier-return", icon: Truck, roles: ["admin", "owner"] },
    { title: "Remove or write off stock", description: "Record damaged, wasted, or missing items.", path: "adjustment", icon: PackageMinus, roles: ["admin", "owner"] },
];

export default function StockManagement() {
    const role = useAuthStore((state) => state.user?.role);
    return (
        <section className="space-y-5">
            <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
                <h1 className="flex items-center gap-2 text-xl font-semibold"><Boxes size={20} aria-hidden="true" /> Stock movements</h1>
                <div className="flex flex-wrap gap-2">
                    {role !== "owner" && <Button asChild variant="outline"><Link to="orders">Checkout orders</Link></Button>}
                    <Button asChild variant="outline"><Link to="/reports/stock"><ClipboardList size={16} /> Stock report</Link></Button>
                </div>
            </header>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {actions.filter((action) => role && action.roles.includes(role)).map(({ title, description, path, icon: Icon }) => (
                    <Link key={path} to={path} className="flex items-start gap-3 rounded-xl border border-border bg-card p-5 hover:border-brand-300 hover:bg-brand-50">
                        <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-brand-100 text-link"><Icon size={19} aria-hidden="true" /></span>
                        <div className="min-w-0 flex-1"><h2 className="font-semibold">{title}</h2><p className="mt-1 text-sm text-muted-foreground">{description}</p></div>
                        <ArrowUpRight size={16} className="shrink-0 text-link" aria-hidden="true" />
                    </Link>
                ))}
            </div>
        </section>
    );
}
