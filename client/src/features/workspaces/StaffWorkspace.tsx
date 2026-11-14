import { ClipboardList, RotateCcw, ShoppingCart, Users } from "lucide-react";
import { Link } from "react-router-dom";

const actions = [
    { title: "New sale", description: "Open the register and collect payment", to: "/stock-movements/sale", icon: ShoppingCart },
    { title: "Customer returns", description: "Record items returned to the store", to: "/stock-movements/customer-return", icon: RotateCcw },
    { title: "Online orders", description: "Review and fulfill store orders", to: "/stock-movements/orders", icon: ClipboardList },
    { title: "Customers", description: "Find and record customer contacts", to: "/staff/customers", icon: Users },
];

export default function StaffWorkspace() {
    return (
        <main className="mx-auto max-w-5xl space-y-6 p-4 sm:p-8">
            <h1 className="text-2xl font-semibold">Store operations</h1>
            <nav aria-label="Store operations" className="grid gap-3 sm:grid-cols-2">
                {actions.map(({ title, description, to, icon: Icon }) => (
                    <Link key={to} to={to} className="flex min-h-28 items-center gap-4 rounded-2xl border border-border bg-card p-5 hover:border-brand-500 hover:bg-brand-50">
                        <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-brand-100 text-link"><Icon aria-hidden="true" /></span>
                        <span><span className="block text-lg font-semibold">{title}</span><span className="block text-sm text-muted-foreground">{description}</span></span>
                    </Link>
                ))}
            </nav>
        </main>
    );
}
