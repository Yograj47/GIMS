import { useId, type ReactNode } from "react";

export const entityInput = "min-h-10 w-full rounded-sm border border-input bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground aria-invalid:border-destructive";

export function EntityField({ label, hint, error, children }: {
    label: string;
    hint: string;
    error?: string;
    children: (props: { id: string; "aria-describedby": string; "aria-invalid": boolean }) => ReactNode;
}) {
    const id = useId();
    return (
        <div className="min-w-0 space-y-1.5">
            <label htmlFor={id} className="block text-sm font-semibold">{label}</label>
            {children({ id, "aria-describedby": error ? `${id}-hint ${id}-error` : `${id}-hint`, "aria-invalid": !!error })}
            <p id={`${id}-hint`} className="text-sm text-muted-foreground">{hint}</p>
            {error && <p id={`${id}-error`} role="alert" className="text-sm text-destructive">{error}</p>}
        </div>
    );
}

export function EntitySection({ title, children }: { title: string; children: ReactNode }) {
    return (
        <section className="space-y-4 border-t-2 border-input py-5 first:border-t-0 first:pt-0">
            <h2 className="text-base font-semibold">{title}</h2>
            {children}
        </section>
    );
}
