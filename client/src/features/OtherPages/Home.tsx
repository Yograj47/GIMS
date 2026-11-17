import { Boxes, ChartNoAxesCombined, ShoppingBasket, Store, Truck } from "lucide-react";
import LoginForm from "@/features/auth/components/LoginForm";

const workflows = [
    { icon: Boxes, name: "Inventory" },
    { icon: ShoppingBasket, name: "Sales" },
    { icon: Truck, name: "Suppliers" },
    { icon: ChartNoAxesCombined, name: "Accounting" },
];

export default function Home() {
    return (
        <section className="grid overflow-hidden rounded-xl border border-border bg-card shadow-lg shadow-brand-800/5 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-500 md:grid-cols-[1.15fr_1fr]">
            <div className="relative flex flex-col justify-between gap-8 overflow-hidden border-b border-border bg-secondary px-6 py-8 text-foreground md:border-b-0 md:border-r dark:bg-brand-950 sm:px-10 sm:py-10 lg:px-12 lg:py-12">
                <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,var(--palette-sky),transparent_70%)] opacity-30 dark:opacity-15" />
                <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,var(--foreground)_1px,transparent_1px),linear-gradient(to_bottom,var(--foreground)_1px,transparent_1px)] bg-size-[32px_32px] opacity-[0.045]" />
                <div className="relative">
                    <div className="mb-5 grid size-11 place-items-center rounded-lg border border-border bg-card text-link">
                        <Store className="size-5" aria-hidden="true" />
                    </div>
                    <h1 className="max-w-sm text-balance text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
                        Store workspace
                    </h1>
                    <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground sm:text-base">
                        Manage stock, serve customers, and keep the store’s accounts up to date.
                    </p>
                </div>
                <ul className="relative hidden grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border md:grid">
                    {workflows.map(({ icon: Icon, name }, index) => (
                        <li key={name} style={{ animationDelay: `${180 + index * 95}ms` }} className="flex items-center gap-2.5 bg-card px-4 py-3 text-sm motion-safe:animate-[workspace-highlight_800ms_ease-out]">
                            <Icon className="size-4 shrink-0 text-link" aria-hidden="true" />
                            {name}
                        </li>
                    ))}
                </ul>
            </div>
            <div className="flex flex-col justify-center px-6 py-8 sm:px-10 sm:py-10 lg:px-12 lg:py-12">
                <h2 className="text-2xl font-semibold tracking-tight">Sign in</h2>
                <p className="mb-6 mt-1.5 text-sm text-muted-foreground">Use your store team account.</p>
                <LoginForm />
            </div>
        </section>
    );
}
