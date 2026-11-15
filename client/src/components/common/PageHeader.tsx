import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

export function PageHeader({ title, description, icon: Icon, children }: {
    title: string;
    description?: string;
    icon?: LucideIcon;
    children?: ReactNode;
}) {
    return (
        <header className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2.5">
                {Icon && <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-accent text-accent-foreground"><Icon size={16} aria-hidden="true" /></span>}
                <div className="min-w-0">
                    <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
                    {description && <p className="text-sm text-muted-foreground">{description}</p>}
                </div>
            </div>
            {children}
        </header>
    );
}
