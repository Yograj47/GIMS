import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export function SettingsPageHeader({ title, description, icon: Icon, children }: {
    title: string;
    description: string;
    icon: LucideIcon;
    children?: ReactNode;
}) {
    return (
        <header className="mb-5 flex flex-wrap items-center justify-between gap-4 border-b border-border pb-5 sm:mb-6">
            <div className="flex min-w-0 items-start gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-brand-100 text-link">
                    <Icon size={19} aria-hidden="true" />
                </span>
                <div>
                    <h1 className="text-xl font-semibold tracking-tight text-foreground">{title}</h1>
                    <p className="mt-1 text-sm text-muted-foreground">{description}</p>
                </div>
            </div>
            {children}
        </header>
    );
}

export function SettingsSearch({ label, value, onChange }: {
    label: string;
    value: string;
    onChange: (value: string) => void;
}) {
    return (
        <div className="relative mb-4 w-full sm:max-w-sm">
            <Search size={17} aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground" />
            <Input type="search" aria-label={label} placeholder={label} value={value}
                onChange={(event) => onChange(event.target.value)} className="h-11 bg-card pl-9" />
        </div>
    );
}
